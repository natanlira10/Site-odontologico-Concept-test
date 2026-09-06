import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Database } from '../database/database.service';
import { User } from '../auth/auth.types';
import { staffDentist } from '../auth/staff-access';
import { ScheduleService } from './schedule.service';

type Block = { id: string; dentist_id: string; starts_at: Date; ends_at: Date };
type Toggle = { dentistId?: string; startsAt: Date; endsAt: Date; available: boolean };

@Injectable()
export class AvailabilityService {
  constructor(private readonly db: Database, private readonly schedule: ScheduleService) {}

  async blocks(user: User, query: { dentistId?: string; from: Date; to: Date }) {
    const dentistId = staffDentist(user, query.dentistId);
    return (await this.db.query<Block>(
      'SELECT * FROM schedule_blocks WHERE dentist_id = $1 AND starts_at < $3 AND ends_at > $2 ORDER BY starts_at',
      [dentistId, query.from, query.to])).rows;
  }

  async toggle(user: User, input: Toggle) {
    const dentistId = staffDentist(user, input.dentistId);
    const { startsAt, endsAt, available } = input;
    if (startsAt <= new Date() || endsAt <= startsAt || +endsAt - +startsAt > 12 * 3600000) {
      throw new BadRequestException('Select a future interval lasting at most 12 hours');
    }
    return this.db.transaction(async (client) => {
      // Booking, rescheduling and work-window changes acquire this same lock first.
      await this.schedule.lockDentist(client, dentistId);
      const window = await client.query(
        `SELECT id FROM schedule_windows WHERE dentist_id = $1 AND starts_at <= $2 AND ends_at >= $3
         AND mod(extract(epoch FROM ($2::timestamptz - starts_at))::numeric, 900) = 0
         AND mod(extract(epoch FROM ($3::timestamptz - starts_at))::numeric, 900) = 0`,
        [dentistId, startsAt, endsAt]);
      if (!window.rowCount) throw new ConflictException('Select a 15-minute interval inside a work window');
      if (!available) {
        const booked = await client.query(
          `SELECT id FROM appointments WHERE dentist_id = $1 AND status <> 'cancelled'
           AND starts_at < $3 AND ends_at > $2 LIMIT 1`, [dentistId, startsAt, endsAt]);
        if (booked.rowCount) throw new ConflictException('Reschedule or cancel appointments before blocking this interval');
      }
      const { rows: overlaps } = await client.query<Block>(
        'SELECT * FROM schedule_blocks WHERE dentist_id = $1 AND starts_at < $3 AND ends_at > $2 FOR UPDATE',
        [dentistId, startsAt, endsAt]);
      const result = { dentistId, startsAt, endsAt, available };
      if (available && !overlaps.length) return result;
      if (!available && overlaps.some((block) => block.starts_at <= startsAt && block.ends_at >= endsAt)) return result;

      await client.query('DELETE FROM schedule_blocks WHERE id = ANY($1::uuid[])', [overlaps.map((block) => block.id)]);
      const fragments: [Date, Date][] = [];
      if (available) {
        for (const block of overlaps) {
          // Reopening a sub-interval must retain the blocked time on either side.
          if (block.starts_at < startsAt) fragments.push([block.starts_at, startsAt]);
          if (block.ends_at > endsAt) fragments.push([endsAt, block.ends_at]);
        }
      } else {
        fragments.push([
          new Date(Math.min(+startsAt, ...overlaps.map((block) => +block.starts_at))),
          new Date(Math.max(+endsAt, ...overlaps.map((block) => +block.ends_at))),
        ]);
      }
      for (const [from, to] of fragments) {
        await client.query('INSERT INTO schedule_blocks (dentist_id, starts_at, ends_at) VALUES ($1, $2, $3)', [dentistId, from, to]);
      }
      await client.query(
        'INSERT INTO availability_events (dentist_id, actor_id, starts_at, ends_at, available) VALUES ($1, $2, $3, $4, $5)',
        [dentistId, user.id, startsAt, endsAt, available]);
      return result;
    });
  }
}
