<script setup lang="ts">
import { ref } from 'vue';
import Navbar from '@/components/common/Navbar.vue';
import HeroSection from '@/components/home/HeroSection.vue';
import PhilosophySection from '@/components/home/PhilosophySection.vue';
import TreatmentCarousel from '@/components/home/TreatmentCarousel.vue';
import BeforeAfterComparison from '@/components/home/BeforeAfterComparison.vue';
import DoctorTeamSection from '@/components/home/DoctorTeamSection.vue';
import TestimonialsSection from '@/components/home/TestimonialsSection.vue';
import AppointmentBooking from '@/components/booking/AppointmentBooking.vue';
import AdminDashboard from '@/components/admin/AdminDashboard.vue';
import Footer from '@/components/common/Footer.vue';
import LoginModal from '@/components/auth/LoginModal.vue';
import NotificationToast from '@/components/common/NotificationToast.vue';
import { useScrollObserver } from '@/composables/useScrollObserver';

// Initialize scroll reveal observer
useScrollObserver();

const toast = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error' | 'info',
});
</script>

<template>
  <div class="min-h-screen bg-pearl-50 text-navy-950 selection:bg-gold-500 selection:text-white flex flex-col font-sans">
    <!-- Fixed Glassmorphic Navbar -->
    <Navbar />

    <!-- Main Page Content -->
    <main class="flex-grow">
      <!-- 1. Hero Presentation -->
      <HeroSection />

      <!-- 2. Clinical Differentiators & Philosophy -->
      <PhilosophySection />

      <!-- 3. Interactive Treatment Carousel -->
      <TreatmentCarousel />

      <!-- 4. Interactive Before / After Smile Transformations -->
      <BeforeAfterComparison />

      <!-- 5. Specialists & Credentials -->
      <DoctorTeamSection />

      <!-- 6. Patient Testimonials -->
      <TestimonialsSection />

      <!-- 7. Modular Appointment Booking Wizard -->
      <AppointmentBooking />

      <!-- 8. Secure Dentist / Admin Dashboard Section -->
      <AdminDashboard />
    </main>

    <!-- Prestige Clinic Footer -->
    <Footer />

    <!-- Modular Patient Portal Authentication Modal -->
    <LoginModal />

    <!-- Global Floating Feedback Toast -->
    <NotificationToast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
  </div>
</template>
