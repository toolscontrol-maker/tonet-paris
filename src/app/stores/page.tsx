"use client";

import { useTranslation } from "@/lib/i18n";
import { useLocale } from "@/context/LocaleContext";
import { useState } from "react";
import { MapPin, Phone, Clock, Mail, Search } from "lucide-react";

interface Store {
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  email: string;
}

const storeData: Record<string, Store[]> = {
  en: [
    {
      name: "PARIS FLAGSHIP",
      city: "Paris",
      address: "213 Rue Saint-Honoré, 75001 Paris, France",
      phone: "+33 1 40 20 00 00",
      hours: "Monday - Saturday: 10:00 - 19:00 | Sunday: Closed",
      email: "paris@tonetparis.com"
    },
    {
      name: "MILAN ATELIER",
      city: "Milan",
      address: "Via Montenapoleone 8, 20121 Milano, Italy",
      phone: "+39 02 7600 0000",
      hours: "Monday - Saturday: 10:00 - 19:30 | Sunday: 11:00 - 19:00",
      email: "milano@tonetparis.com"
    },
    {
      name: "MADRID BOUTIQUE",
      city: "Madrid",
      address: "Calle de Serrano 48, 28001 Madrid, Spain",
      phone: "+34 91 575 0000",
      hours: "Monday - Saturday: 10:00 - 20:30 | Sunday: Closed",
      email: "madrid@tonetparis.com"
    },
    {
      name: "LOS ANGELES CONCEPT",
      city: "Los Angeles",
      address: "8400 Melrose Ave, Los Angeles, CA 90069, USA",
      phone: "+1 323 650 0000",
      hours: "Monday - Saturday: 11:00 - 19:00 | Sunday: 12:00 - 18:00",
      email: "la@tonetparis.com"
    }
  ],
  es: [
    {
      name: "PARIS FLAGSHIP",
      city: "París",
      address: "213 Rue Saint-Honoré, 75001 París, Francia",
      phone: "+33 1 40 20 00 00",
      hours: "Lunes - Sábado: 10:00 - 19:00 | Domingo: Cerrado",
      email: "paris@tonetparis.com"
    },
    {
      name: "MILAN ATELIER",
      city: "Milán",
      address: "Via Montenapoleone 8, 20121 Milán, Italia",
      phone: "+39 02 7600 0000",
      hours: "Lunes - Sábado: 10:00 - 19:30 | Domingo: 11:00 - 19:00",
      email: "milano@tonetparis.com"
    },
    {
      name: "MADRID BOUTIQUE",
      city: "Madrid",
      address: "Calle de Serrano 48, 28001 Madrid, España",
      phone: "+34 91 575 0000",
      hours: "Lunes - Sábado: 10:00 - 20:30 | Domingo: Cerrado",
      email: "madrid@tonetparis.com"
    },
    {
      name: "LOS ANGELES CONCEPT",
      city: "Los Ángeles",
      address: "8400 Melrose Ave, Los Ángeles, CA 90069, EE. UU.",
      phone: "+1 323 650 0000",
      hours: "Lunes - Sábado: 11:00 - 19:00 | Domingo: 12:00 - 18:00",
      email: "la@tonetparis.com"
    }
  ],
  fr: [
    {
      name: "PARIS FLAGSHIP",
      city: "Paris",
      address: "213 Rue Saint-Honoré, 75001 Paris, France",
      phone: "+33 1 40 20 00 00",
      hours: "Lundi - Samedi : 10:00 - 19:00 | Dimanche : Fermé",
      email: "paris@tonetparis.com"
    },
    {
      name: "MILAN ATELIER",
      city: "Milan",
      address: "Via Montenapoleone 8, 20121 Milan, Italie",
      phone: "+39 02 7600 0000",
      hours: "Lundi - Samedi : 10:00 - 19:30 | Dimanche : 11:00 - 19:00",
      email: "milano@tonetparis.com"
    },
    {
      name: "MADRID BOUTIQUE",
      city: "Madrid",
      address: "Calle de Serrano 48, 28001 Madrid, Espagne",
      phone: "+34 91 575 0000",
      hours: "Lundi - Samedi : 10:00 - 20:30 | Dimanche : Fermé",
      email: "madrid@tonetparis.com"
    },
    {
      name: "LOS ANGELES CONCEPT",
      city: "Los Angeles",
      address: "8400 Melrose Ave, Los Angeles, CA 90069, États-Unis",
      phone: "+1 323 650 0000",
      hours: "Lundi - Samedi : 11:00 - 19:00 | Dimanche : 12:00 - 18:00",
      email: "la@tonetparis.com"
    }
  ]
};

const searchPlaceholder: Record<string, string> = {
  en: "Search by city...",
  es: "Buscar por ciudad...",
  fr: "Rechercher par ville..."
};

export default function StoresPage() {
  const { t } = useTranslation();
  const { language } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");

  const activeLang = storeData[language] ? language : "en";
  const stores = storeData[activeLang];

  const filteredStores = stores.filter(
    (store) =>
      store.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="stores-container">
        <div className="stores-overlay" />
        
        <div className="stores-content">
          <header className="stores-header">
            <span className="stores-eyebrow">TONET TORRENTINNI</span>
            <h1 className="stores-title">{t("storesTitle")}</h1>
            <p className="stores-desc">{t("storesDesc")}</p>
          </header>

          <div className="search-box-wrap">
            <div className="search-box-inner">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                className="search-input"
                placeholder={searchPlaceholder[activeLang] || "Search..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="stores-grid">
            {filteredStores.map((store) => (
              <div key={store.name} className="store-card">
                <h2 className="store-card-name">{store.name}</h2>
                
                <div className="store-card-details">
                  <div className="store-detail-row">
                    <MapPin className="detail-icon" size={14} />
                    <span>{store.address}</span>
                  </div>
                  
                  <div className="store-detail-row">
                    <Phone className="detail-icon" size={14} />
                    <a href={`tel:${store.phone.replace(/\s+/g, "")}`} className="store-link">
                      {store.phone}
                    </a>
                  </div>

                  <div className="store-detail-row">
                    <Clock className="detail-icon" size={14} />
                    <span>{store.hours}</span>
                  </div>

                  <div className="store-detail-row">
                    <Mail className="detail-icon" size={14} />
                    <a href={`mailto:${store.email}`} className="store-link">
                      {store.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredStores.length === 0 && (
            <div className="no-results">
              {activeLang === "es"
                ? "No se encontraron tiendas."
                : activeLang === "fr"
                ? "Aucune boutique trouvée."
                : "No stores found."}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .stores-container {
          min-height: 100vh;
          position: relative;
          background-image: url('/stores-bg.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          color: #fff;
          padding: 140px 24px 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-sizing: border-box;
        }

        .stores-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.8) 0%,
            rgba(0, 0, 0, 0.7) 50%,
            rgba(0, 0, 0, 0.9) 100%
          );
          z-index: 1;
        }

        .stores-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1100px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stores-header {
          text-align: center;
          margin-bottom: 48px;
          max-width: 600px;
        }

        .stores-eyebrow {
          display: block;
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.52em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
          font-family: var(--font-primary);
          margin-bottom: 16px;
        }

        .stores-title {
          font-size: clamp(28px, 4.5vw, 48px);
          font-weight: 300;
          letter-spacing: 0.03em;
          font-family: var(--font-brand);
          margin: 0 0 16px;
          text-transform: uppercase;
        }

        .stores-desc {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.6);
          font-family: var(--font-primary);
          margin: 0;
        }

        .search-box-wrap {
          width: 100%;
          max-width: 450px;
          margin-bottom: 56px;
        }

        .search-box-inner {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 12px 16px;
          transition: border-color 0.3s, background-color 0.3s;
          border-radius: 0; /* Rectangular Borders Rule */
        }

        .search-box-inner:focus-within {
          border-color: rgba(255, 255, 255, 0.45);
          background: rgba(255, 255, 255, 0.08);
        }

        .search-icon {
          color: rgba(255, 255, 255, 0.4);
          margin-right: 12px;
          flex-shrink: 0;
        }

        .search-input {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 13px;
          width: 100%;
          outline: none;
          font-family: var(--font-primary);
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }

        .stores-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 28px;
          width: 100%;
        }

        .store-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 36px;
          transition: border-color 0.3s, background-color 0.3s, transform 0.3s;
          border-radius: 0; /* Rectangular Borders Rule */
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .store-card:hover {
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
        }

        .store-card-name {
          font-size: 18px;
          font-weight: 400;
          letter-spacing: 0.08em;
          font-family: var(--font-brand);
          margin: 0 0 24px;
          color: #fff;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 14px;
        }

        .store-card-details {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .store-detail-row {
          display: flex;
          align-items: flex-start;
          font-size: 12px;
          font-weight: 300;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.7);
          font-family: var(--font-primary);
        }

        .detail-icon {
          color: rgba(255, 255, 255, 0.35);
          margin-right: 12px;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .store-link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: color 0.2s;
        }

        .store-link:hover {
          color: #fff;
          text-decoration: underline;
        }

        .no-results {
          margin-top: 40px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.4);
          font-family: var(--font-primary);
        }

        @media (max-width: 768px) {
          .stores-container {
            padding: 100px 16px 60px;
          }
          
          .stores-header {
            margin-bottom: 32px;
          }

          .search-box-wrap {
            margin-bottom: 36px;
          }

          .stores-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .store-card {
            padding: 24px;
          }

          .store-card-name {
            font-size: 16px;
            margin-bottom: 18px;
            padding-bottom: 10px;
          }
        }
      `}</style>
    </>
  );
}
