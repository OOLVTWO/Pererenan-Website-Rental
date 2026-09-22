'use client';

/**
 * Modal invoice WhatsApp — dipisah dari halaman Transaksi dan dimuat hanya saat
 * dibuka (next/dynamic), supaya halaman Transaksi lebih ringan.
 */
import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { formatRupiah, getLocalDateStr, toLocalDateStr } from '@/lib/finance';
import { getWhatsAppShareUrl, generateInvoiceText, generateInvoiceNumber } from '@/lib/countryCodes';
import { getPaymentMethodMeta } from '@/lib/paymentMethods';
import { resolvePhotoDataUrl } from '@/lib/handoverPhoto';
import { createClient } from '@/lib/supabase/client';



// ===== MODAL KIRIM INVOICE WHATSAPP =====
export default function WhatsAppInvoiceModal({ isOpen, onClose, tx, vehicle }) {
  const [activeTab, setActiveTab] = useState('text');
  const [customMsg, setCustomMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [sharing, setSharing] = useState(false);

  const paymentMeta = getPaymentMethodMeta(tx?.payment_method);
  const invoiceNumber = tx ? generateInvoiceNumber(tx) : '-';
  // English-only label for the invoice specifically — paymentMeta.label is
  // shared with the rest of the (Indonesian) admin dashboard, so translate
  // separately here rather than changing that shared source.
  const PAYMENT_LABEL_EN = {
    cash: 'Cash', transfer_bca: 'Bank Transfer (BCA)', transfer_mandiri: 'Bank Transfer (Mandiri)',
    qris: 'QRIS / GoPay / OVO', card: 'Credit / Debit Card', wise: 'Wise / Revolut',
    transfer: 'Bank Transfer',
  };
  const paymentLabelEn = PAYMENT_LABEL_EN[paymentMeta.id] || paymentMeta.label;

  // Generate pesan invoice saat modal dibuka — pola resmi React
  // "adjust state during render" (menggantikan useEffect + setState sinkron)
  const [prevInvoiceKey, setPrevInvoiceKey] = useState(null);
  const invoiceKey = isOpen && tx ? tx.id : null;
  if (invoiceKey !== prevInvoiceKey) {
    setPrevInvoiceKey(invoiceKey);
    if (invoiceKey) {
      setCustomMsg(generateInvoiceText(tx, vehicle, paymentMeta));
    }
  }

  if (!isOpen || !tx) return null;

  const waUrl = getWhatsAppShareUrl(tx.renter_phone, customMsg);

  const handleCopy = () => {
    navigator.clipboard.writeText(customMsg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // WhatsApp's wa.me click-to-chat links can only pre-fill text — there is
  // no way to auto-attach a file through that URL scheme, on any plan,
  // free or paid. So true "share this invoice directly to WhatsApp" only
  // works via the native OS share sheet (Web Share API with a file),
  // which most mobile Chrome/Safari support — the user picks WhatsApp
  // from their own share sheet and the PDF arrives already attached.
  // Where that's not supported (most desktop browsers), we fall back to:
  // download the PDF, then open the WA chat so it's one tap away from
  // being attached manually.
  //
  // Also: the whole point of "Bagikan Langsung" is calling navigator.share()
  // as close as possible to the user's click, since browsers only allow the
  // Web Share API within a short window of "user activation" after a real
  // gesture. Measured this rendering + encoding pipeline taking ~2.8s at
  // scale:2 with PNG encoding — long enough that by the time share() was
  // finally called, several browsers had likely already invalidated that
  // activation window, silently failing the share (or throwing
  // NotAllowedError) with no visible symptom beyond "the button doesn't do
  // anything". Scale reduced to 1.5 and switched to JPEG (much faster to
  // encode than lossless PNG, and the invoice is a flat-color business
  // document, not a photo, so the quality loss at 0.92 is not visible) to
  // substantially cut that delay.
  const renderInvoiceCanvas = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const node = document.getElementById('visual-invoice-card');
    return html2canvas(node, {
      backgroundColor: '#FFFFFF',
      scale: 1.5,
      useCORS: true,
    });
  };

  // A5 is literally "A4 cut in half" (148 x 210mm) — the requested size.
  // The invoice card's own aspect ratio is preserved and centered on the
  // page rather than stretched, so it never looks distorted.
  const buildInvoicePdf = async () => {
    const { jsPDF } = await import('jspdf');
    const canvas = await renderInvoiceCanvas();
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 6;
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;

    const imgRatio = canvas.width / canvas.height;
    let renderW = maxW;
    let renderH = renderW / imgRatio;
    if (renderH > maxH) {
      renderH = maxH;
      renderW = renderH * imgRatio;
    }
    const x = (pageW - renderW) / 2;
    const y = (pageH - renderH) / 2;

    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', x, y, renderW, renderH);
    return pdf;
  };

  const handleShareDirect = async () => {
    setSharing(true);
    try {
      const pdf = await buildInvoicePdf();
      const blob = pdf.output('blob');
      const file = new File([blob], `Invoice-${invoiceNumber}.pdf`, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Invoice ${invoiceNumber}`,
          text: `Invoice sewa motor dari Boss Rent Pererenan untuk ${tx.renter_name}.`,
        });
      } else {
        // Device reports share support but not for files — fall back.
        await handleDownloadPdf();
      }
    } catch (err) {
      // AbortError = user closed the share sheet without picking anything —
      // not a real failure, don't show an error for it.
      if (err?.name === 'AbortError') {
        // no-op
      } else if (err?.name === 'NotAllowedError') {
        // Web Share API requires the call to land within a short window of
        // the user's actual click ("user activation"). If PDF generation
        // still takes too long on a slower device even after speeding it
        // up, this is the specific error browsers throw — worth a distinct
        // message since "gagal membagikan" alone doesn't explain why, and
        // simply retrying often works once the device/network isn't busy.
        console.error('Share invoice - user activation expired:', err);
        alert('Berbagi tidak sempat diproses HP Anda. Silakan coba lagi, atau gunakan Download PDF Invoice.');
      } else {
        console.error('Gagal share invoice:', err);
        alert('Gagal membagikan invoice. Silakan gunakan opsi Download PDF Invoice sebagai gantinya.');
      }
    }
    setSharing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const pdf = await buildInvoicePdf();
      pdf.save(`Invoice-${invoiceNumber}.pdf`);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('Gagal membuat PDF invoice:', err);
      alert('Gagal mengunduh PDF invoice. Silakan coba lagi atau gunakan opsi Cetak / Print.');
    }
    setDownloading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header no-print">
          <div>
            <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon fa="fa-brands fa-whatsapp" style={{ color: '#1D4ED8', fontSize: '20px' }} />
              Kirim Invoice WhatsApp & Pesan Customer
            </div>
            <div className="modal-subtitle">
              Penyewa: <strong>{tx.renter_name}</strong> ({tx.renter_phone})
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tab Selector */}
        <div className="no-print" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            className={`btn btn-${activeTab === 'text' ? 'primary' : 'secondary'} btn-sm`}
            onClick={() => setActiveTab('text')}
          >
            <Icon fa="fa-brands fa-whatsapp" style={{ marginRight: '6px' }} /> Format Text WA
          </button>
          <button
            className={`btn btn-${activeTab === 'visual' ? 'primary' : 'secondary'} btn-sm`}
            onClick={() => setActiveTab('visual')}
          >
            <Icon fa="fa-solid fa-file-invoice" style={{ marginRight: '6px' }} /> Kartu Invoice Gambar / Print
          </button>
        </div>

        {activeTab === 'text' ? (
          <div>
            <div className="form-group">
              <label className="form-label">
                Text Invoice Formal (Dapat Diedit):
              </label>
              <textarea
                className="form-control"
                rows={12}
                value={customMsg}
                onChange={e => setCustomMsg(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '12.5px', lineHeight: 1.5, resize: 'vertical' }}
              />
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={handleCopy}>
                <Icon fa={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} style={{ marginRight: '6px' }} />
                {copied ? 'Tercopy!' : 'Copy Text Invoice'}
              </button>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
                style={{ textDecoration: 'none', background: '#1D4ED8', borderColor: '#1D4ED8', color: '#fff' }}
              >
                <Icon fa="fa-brands fa-whatsapp" style={{ marginRight: '6px', fontSize: '16px' }} />
                Buka WhatsApp & Kirim Pesan
              </a>
            </div>
          </div>
        ) : (
          /* VISUAL INVOICE CARD FOR PRINT / IMAGE SHARE — white, print-appropriate
             document design (not a dark UI card). A printed invoice with a dark
             background reads as an app screenshot, not a formal document, and
             wastes ink if actually printed on paper. */
          <div>
            {/* Fixed fixed-width scroll wrapper — the card itself always renders
                at a real desktop-scale width (1050px) via the explicit width
                below, regardless of the actual screen size viewing this modal.
                Without this, opening the invoice from a phone (where this modal
                itself only has ~350px to work with) made html2canvas capture the
                card at that same cramped width, squeezing every heading and
                table row into a narrow column and clipping the price table
                clean off the right edge in the exported PDF. This wrapper just
                lets a phone user scroll sideways to preview it; the capture
                itself is unaffected by scroll position since the card's actual
                width is fixed either way. */}
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div id="visual-invoice-card" style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              padding: '32px',
              color: '#1E293B',
              width: '1050px',
              maxWidth: 'none',
            }}>
              {/* Header: Company info left, INVOICE title/number/date right */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1E293B', paddingBottom: '18px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '19px', fontWeight: 800, color: '#1E293B' }}>
                    <Icon fa="fa-solid fa-motorcycle" style={{ color: '#2563EB' }} />
                    BOSS RENT PERERENAN
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '5px', lineHeight: 1.6 }}>
                    Jl. Pantai Pererenan, Canggu, Badung, Bali 80351<br />
                    WhatsApp: +62 812-3710-9751
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#2563EB', letterSpacing: '1.5px' }}>INVOICE</div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                    No: <strong style={{ color: '#1E293B' }}>{invoiceNumber}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Date: <strong style={{ color: '#1E293B' }}>{tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</strong>
                  </div>
                  <span style={{
                    display: 'inline-block', marginTop: '8px', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                    background: tx.status === 'completed' ? '#EEF3FF' : '#DBEAFE',
                    color: tx.status === 'completed' ? '#1D4ED8' : '#2563EB',
                    border: `1px solid ${tx.status === 'completed' ? '#BFD1FF' : '#93C5FD'}`,
                  }}>
                    {tx.status === 'completed' ? 'PAID' : 'ACTIVE RENTAL'}
                  </span>
                </div>
              </div>

              {/* Renter & Vehicle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', background: '#F8FAFC', padding: '16px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>Renter</div>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginTop: '3px', color: '#1E293B' }}>{tx.renter_name}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>{tx.renter_phone}</div>
                  {tx.renter_address && (
                    <div style={{ fontSize: '11.5px', color: '#2563EB', marginTop: '4px' }}>
                      <Icon fa="fa-solid fa-location-dot" style={{ marginRight: '4px' }} /> {tx.renter_address}
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>Vehicle</div>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginTop: '3px', color: '#2563EB' }}>{vehicle?.name || 'Motor'}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>Plate: <strong style={{ color: '#1E293B' }}>{vehicle?.plate_number}</strong></div>
                </div>
              </div>

              {/* Documentation Photos on Invoice Card */}
              {tx.handover_image_url && (
                <div style={{ marginBottom: '20px', background: '#F8FAFC', padding: '14px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon fa="fa-solid fa-camera" style={{ color: '#2563EB' }} /> Transaction Photo Documentation
                  </div>
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    {tx.handover_image_url && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <img src={tx.handover_image_url} alt="Handover" style={{ width: '110px', height: '76px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #CBD5E1' }} />
                        <span style={{ fontSize: '10px', color: '#2563EB', fontWeight: 700 }}>✓ Handover Photo (Renter + Motorbike)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dates & Pricing Table */}
              <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', marginBottom: '18px', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #1E293B', color: '#64748B', textAlign: 'left' }}>
                    <th style={{ padding: '8px 4px', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Description</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Duration / Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 4px' }}>Rental Period ({new Date(tx.start_date).toLocaleDateString('en-GB')} to {new Date(tx.end_date).toLocaleDateString('en-GB')})</td>
                    <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 600 }}>{tx.duration_days} Day{tx.duration_days === 1 ? '' : 's'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 4px' }}>Daily Rate</td>
                    <td style={{ padding: '10px 4px', textAlign: 'right' }}>{formatRupiah(vehicle?.rate_per_day)} / day</td>
                  </tr>
                  {tx.discount > 0 && (
                    <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#1E40AF' }}>
                      <td style={{ padding: '10px 4px' }}>Discount</td>
                      <td style={{ padding: '10px 4px', textAlign: 'right' }}>-{formatRupiah(tx.discount)}</td>
                    </tr>
                  )}
                  <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 4px' }}>Security Deposit (Held)</td>
                    <td style={{ padding: '10px 4px', textAlign: 'right' }}>{formatRupiah(tx.deposit)}</td>
                  </tr>
                  <tr style={{ fontWeight: 800, fontSize: '15px' }}>
                    <td style={{ padding: '14px 4px 4px 4px', color: '#2563EB' }}>TOTAL PAYMENT</td>
                    <td style={{ padding: '14px 4px 4px 4px', textAlign: 'right', color: '#2563EB' }}>{formatRupiah(tx.total_price)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Rental Regulation — 2-column layout since A5 landscape gives
                  plenty of width, keeping the whole invoice on one page even
                  with this added. */}
              <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                <div style={{ fontSize: '10.5px', color: '#1E293B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                  Rental Regulation
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gridTemplateRows: 'repeat(6, auto)',
                  gridAutoFlow: 'column',
                  columnGap: '28px',
                  rowGap: '3px',
                  fontSize: '9px',
                  color: '#475569',
                  lineHeight: 1.45,
                }}>
                  {[
                    'Non-refundable payment.',
                    'The price is not including with insurance.',
                    "Any damage or loss to the motor bike will be the renter's responsibility.",
                    'Motor Bike not allow to rent with other Renter.',
                    "Motor Bike can't drive on the beach.",
                    'Motor Bike not allow drive to other island.',
                    'Delivery only covers Canggu, Berawa, and Pererenan area.',
                    'Pick up only covers Canggu, Berawa and Pererenan area.',
                    'Lost key penalty IDR 500,000.',
                    'Rental is based on 24 hours/day, delay over 3 hours will be charged as 1 day.',
                    'Please check the Motor Bike condition before use.',
                  ].map((rule, i) => (
                    <div key={i} style={{ display: 'flex', gap: '4px' }}>
                      <span style={{ flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signatures — lines narrower than the full column width (each
                  capped at 200px, centered), with clear breathing room above
                  separating this from the Rental Regulation box. */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '56px', marginBottom: '20px', padding: '0 8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '48px' }}></div>
                  <div style={{ maxWidth: '200px', margin: '0 auto' }}>
                    <div style={{ borderTop: '1px solid #64748B', paddingTop: '6px', fontSize: '11px', color: '#1E293B', fontWeight: 700 }}>Owner</div>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>Boss Rent Pererenan</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '48px' }}></div>
                  <div style={{ maxWidth: '200px', margin: '0 auto' }}>
                    <div style={{ borderTop: '1px solid #64748B', paddingTop: '6px', fontSize: '11px', color: '#1E293B', fontWeight: 700 }}>Renter</div>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>{tx.renter_name}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
                <div>Payment Method: <strong style={{ color: paymentMeta.color }}><Icon fa={paymentMeta.icon} /> {paymentLabelEn}</strong></div>
                <div>Thank you for choosing Boss Rent Bali! 🌴</div>
              </div>
            </div>
            </div>

            <div className="no-print" style={{ marginTop: '16px' }}>
              <div className="alert alert-info" style={{ fontSize: '12px', marginBottom: '12px' }}>
                <Icon fa="fa-solid fa-circle-info" style={{ marginTop: '1px' }} />
                <span>
                  <strong>Bagikan Langsung</strong> membuka menu share HP Anda — pilih WhatsApp dan
                  invoice PDF akan terlampir otomatis di chat customer (didukung sebagian besar HP).
                  Jika tidak muncul opsi share, klik <strong>Download PDF Invoice</strong> lalu klik{' '}
                  <strong>Buka WhatsApp</strong> dan lampirkan file PDF yang sudah terunduh secara manual.
                </span>
              </div>

              <div className="modal-footer" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button className="btn btn-success" onClick={handleShareDirect} disabled={sharing} style={{ background: '#1D4ED8', borderColor: '#1D4ED8', color: '#fff' }}>
                    <Icon fa={`fa-solid ${sharing ? 'fa-spinner fa-spin' : 'fa-share-nodes'}`} style={{ marginRight: '6px' }} />
                    {sharing ? 'Menyiapkan Invoice...' : 'Bagikan Langsung ke WhatsApp'}
                  </button>
                  <button className="btn btn-primary" onClick={handleDownloadPdf} disabled={downloading}>
                    <Icon fa={`fa-solid ${downloading ? 'fa-spinner fa-spin' : downloaded ? 'fa-check' : 'fa-download'}`} style={{ marginRight: '6px' }} />
                    {downloading ? 'Membuat PDF...' : downloaded ? 'Terunduh!' : 'Download PDF Invoice'}
                  </button>
                  <button className="btn btn-secondary" onClick={handlePrint}>
                    <Icon fa="fa-solid fa-print" style={{ marginRight: '6px' }} /> Cetak
                  </button>
                </div>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ textDecoration: 'none' }}
                >
                  <Icon fa="fa-brands fa-whatsapp" style={{ marginRight: '6px', fontSize: '16px', color: '#1D4ED8' }} /> Buka WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== MODAL COMPLETE / FINISH TRANSACTION =====
