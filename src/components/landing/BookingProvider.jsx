'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import BookingSheet from './BookingSheet';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const triggerRef = useRef(null);

  const openSheet = useCallback((trigger) => {
    triggerRef.current = trigger ?? null;
    // Setiap kali dibuka, mulai lagi dari langkah 1.
    setStep(1);
    setOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus?.({ preventScroll: true });
  }, []);

  const value = useMemo(() => ({ openSheet }), [openSheet]);

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingSheet open={open} step={step} onStepChange={setStep} onClose={closeSheet} />
    </BookingContext.Provider>
  );
}

/**
 * Tombol yang di referensi berupa <a href="#"> dan membuka sheet booking.
 * Tetap <a> supaya tampilannya identik dengan elemen aslinya.
 */
export function BookingLink({ className, children }) {
  const ctx = useContext(BookingContext);
  return (
    <a
      href="#booking"
      aria-haspopup="dialog"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        ctx?.openSheet(e.currentTarget);
      }}
    >
      {children}
    </a>
  );
}
