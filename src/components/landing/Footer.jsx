import Image from 'next/image';
import { Icon } from './Icon';
import { Brand } from './Hero';
import { BUSINESS, IMAGES } from '@/lib/landing/config';
import { whatsappUrl } from '@/lib/landing/booking';

const WA = whatsappUrl("Hi Boss Rent! I'd like to rent a scooter.");

/** Footer terang + tombol WhatsApp bulat melayang. */
export default function Footer() {
  return (
    <>
      <footer className="lp-foot">
        <div className="lp-foot-top">
          <div className="lp-foot-main">
            <Brand className="lp-foot-brand lp-dk" />
            <p className="lp-foot-lead lp-dk">Send us your dates and we reply with availability and a delivery time.</p>
            <div className="lp-foot-btns">
              <a className="lp-btn" href={WA} target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" size="19" color="#fff" />
                {` ${BUSINESS.phoneDisplay}`}
              </a>
              <a className="lp-foot-dir lp-dk" href={BUSINESS.mapsUrl} target="_blank" rel="noopener noreferrer">
                <Icon name="pin" size="18" color="#1D4ED8" /> Get directions
              </a>
            </div>
          </div>
          <a href={BUSINESS.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Open in Google Maps">
            <Image
              className="lp-map"
              src={IMAGES.map}
              alt="Map of Bali with Pererenan marked"
              width={1000}
              height={676}
              unoptimized
              loading="lazy"
            />
          </a>
        </div>
        <div className="lp-foot-info">
          <a className="lp-foot-line" href={BUSINESS.mapsUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="pin" size="18" color="#1D4ED8" />
            <span>
              Jl. Pantai Pererenan No.119<span className="lp-mb">, Mengwi,</span>
              <br />
              <span className="lp-dk">Mengwi, </span>Badung, Bali 80351
            </span>
          </a>
          <span className="lp-foot-line">
            <Icon name="clock" size="18" color="#1D4ED8" />
            <span>
              Open daily
              <br className="lp-dk" />
              {` ${BUSINESS.hours}`}
            </span>
          </span>
          <a className="lp-foot-line" href={BUSINESS.instagramUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="instagram" size="18" color="#1D4ED8" />
            <span>
              {BUSINESS.instagram}
              <span className="lp-dk">
                <br />
                {BUSINESS.phoneDisplay}
              </span>
            </span>
          </a>
          <span className="lp-copy lp-mb">{`© ${new Date().getFullYear()} ${BUSINESS.name}`}</span>
        </div>
      </footer>
      <a className="lp-fab" href={WA} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
        <Icon name="whatsapp" size="26" color="#fff" sw="2" />
      </a>
    </>
  );
}
