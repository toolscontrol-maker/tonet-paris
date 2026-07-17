"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  X, 
  Calendar, 
  MessageSquare, 
  HelpCircle, 
  ChevronDown, 
  Camera, 
  Send,
  Accessibility
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "concierge";
  text: string;
  timestamp: string;
}

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false); // Quick actions stack open/closed
  const [isChatOpen, setIsChatOpen] = useState(false); // Live chat overlay open/closed
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat history
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Simulate luxury concierge response
    setTimeout(() => {
      setIsTyping(false);
      const conciergeMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "concierge",
        text: "Gracias por contactar con TONET TORRENTINNI. Un asesor personal se pondrá en contacto contigo de inmediato para asistirte.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, conciergeMsg]);
    }, 1800);
  };

  return (
    <>
      {/* ── FLOATING WIDGET WRAPPER ── */}
      <div className="sw-container">
        
        {/* 1. Closed Floating State & Launcher */}
        {!isOpen && !isChatOpen && (
          <div className="sw-launchers">
            {/* Main Launcher Button */}
            <button 
              className="sw-btn-main" 
              onClick={() => setIsOpen(true)}
              aria-label="Abrir soporte y contacto"
            >
              <span className="sw-logo-initial">T</span>
            </button>

            {/* Secondary Accessibility/Help Button */}
            <button 
              className="sw-btn-secondary"
              onClick={() => console.log("Accesibilidad / Versión simplificada toggle clicked")}
              aria-label="Ayuda y accesibilidad"
            >
              <Accessibility size={16} strokeWidth={1.2} />
            </button>
          </div>
        )}

        {/* 2. Expanded Quick Actions Stack */}
        {isOpen && !isChatOpen && (
          <div className="sw-menu-expanded">
            {/* Quick Actions Stack */}
            <div className="sw-stack">
              <a 
                href="https://wa.me/34600000000" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="sw-pill"
                style={{ "--index": 0 } as React.CSSProperties}
              >
                <span className="sw-pill-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </span>
                <span className="sw-pill-label">WhatsApp</span>
              </a>

              <button 
                className="sw-pill"
                onClick={() => {
                  setIsChatOpen(true);
                  setIsOpen(false);
                }}
                style={{ "--index": 1 } as React.CSSProperties}
              >
                <span className="sw-pill-icon">
                  <MessageSquare size={14} strokeWidth={1.2} />
                </span>
                <span className="sw-pill-label">Live Chat</span>
              </button>

              <button 
                className="sw-pill" 
                onClick={() => {
                  alert("Gracias por tu feedback.");
                  setIsOpen(false);
                }}
                style={{ "--index": 2 } as React.CSSProperties}
              >
                <span className="sw-pill-icon">
                  <HelpCircle size={14} strokeWidth={1.2} />
                </span>
                <span className="sw-pill-label">Feedback</span>
              </button>

              <button 
                className="sw-pill"
                onClick={() => alert("Redirigiendo a reserva de citas...")}
                style={{ "--index": 3 } as React.CSSProperties}
              >
                <span className="sw-pill-icon">
                  <Calendar size={14} strokeWidth={1.2} />
                </span>
                <span className="sw-pill-label">Reservar cita</span>
              </button>
            </div>

            {/* Circular Close Button replaces main launcher */}
            <button 
              className="sw-btn-close" 
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={18} strokeWidth={1.2} />
            </button>

            {/* Secondary Accessibility Button remains visible */}
            <button 
              className="sw-btn-secondary"
              onClick={() => console.log("Accesibilidad / Versión simplificada toggle clicked")}
              aria-label="Ayuda y accesibilidad"
            >
              <Accessibility size={16} strokeWidth={1.2} />
            </button>
          </div>
        )}
      </div>

      {/* 3. Live Chat Immersive Fullscreen Overlay */}
      {isChatOpen && (
        <div className="sw-overlay">
          {/* Header */}
          <header className="sw-header">
            <div className="sw-header-left">
              <MessageSquare size={14} strokeWidth={1.2} className="sw-header-icon" />
              <span className="sw-header-title">Live Chat</span>
            </div>
            <button 
              className="sw-header-close" 
              onClick={() => setIsChatOpen(false)}
              aria-label="Cerrar chat"
            >
              <ChevronDown size={20} strokeWidth={1.2} />
            </button>
          </header>

          {/* Chat Body */}
          <div className="sw-body">
            {messages.length === 0 ? (
              <div className="sw-welcome-container">
                <h1 className="sw-welcome-title">
                  Bienvenido/a a TONET TORRENTINNI, ¿cómo podemos ayudarte?
                </h1>
                <p className="sw-legal-text">
                  Al contactar con TONET TORRENTINNI, el usuario acepta el tratamiento de sus datos personales para actividades vinculadas al servicio de atención al cliente. Consulta nuestra{" "}
                  <Link href="/about" className="sw-link">
                    política de privacidad
                  </Link>{" "}
                  para más información.
                </p>
              </div>
            ) : (
              <div className="sw-chat-history">
                {messages.map((msg) => (
                  <div key={msg.id} className={`sw-msg-row ${msg.sender}`}>
                    <div className="sw-msg-bubble">
                      <p className="sw-msg-text">{msg.text}</p>
                      <span className="sw-msg-time">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="sw-msg-row concierge">
                    <div className="sw-msg-bubble typing">
                      <div className="sw-typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Composer */}
          <form className="sw-composer" onSubmit={handleSendMessage}>
            <div className="sw-input-wrap">
              <input 
                type="text" 
                className="sw-input" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe tu pregunta aquí..."
                aria-label="Escribe tu pregunta aquí"
              />
              {inputText.trim() && (
                <button type="submit" className="sw-send-btn" aria-label="Enviar mensaje">
                  <Send size={14} strokeWidth={1.2} />
                </button>
              )}
            </div>
            
            <button 
              type="button" 
              className="sw-btn-attach" 
              onClick={() => alert("Función para adjuntar imagen próximamente disponible.")}
              aria-label="Adjuntar archivo o imagen"
            >
              <Camera size={18} strokeWidth={1.2} />
            </button>
          </form>
        </div>
      )}

      {/* ── STYLING ── */}
      <style>{`
        /* ══ FLOATING CONTAINER ══ */
        .sw-container {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-family: var(--font-jost), sans-serif;
          pointer-events: auto;
        }

        @media (min-width: 768px) {
          .sw-container {
            bottom: 40px;
            right: 40px;
          }
        }

        /* ══ BUTTON BASES ══ */
        .sw-btn-main, .sw-btn-close {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #0c0c0c;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease;
          outline: none;
        }

        .sw-btn-main:hover, .sw-btn-close:hover {
          transform: scale(1.05);
          background: #141414;
        }

        .sw-btn-secondary {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #0c0c0c;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), color 0.3s ease;
          outline: none;
        }
        .sw-btn-secondary:hover {
          transform: scale(1.05);
          color: #ffffff;
        }

        /* ══ CLOSED LAUNCHER LAYOUT ══ */
        .sw-launchers {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .sw-logo-initial {
          font-family: var(--font-cormorant), serif;
          font-size: 22px;
          font-weight: 300;
          line-height: 1;
          color: #ffffff;
          display: block;
          margin-top: -1px;
        }

        /* ══ MENU EXPANDED ══ */
        .sw-menu-expanded {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }

        /* Stack of pills */
        .sw-stack {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          margin-bottom: 4px;
        }

        .sw-pill {
          background: #0c0c0c;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
          padding: 10px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, opacity 0.35s ease;
          outline: none;
          animation: swPillEntry 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: calc(var(--index) * 0.05s);
          opacity: 0;
          transform: translateY(12px);
        }

        .sw-pill:hover {
          transform: translateY(-2px);
          background: #141414;
          color: #ffffff;
        }

        .sw-pill-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.7);
        }

        .sw-pill-label {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        @keyframes swPillEntry {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ══ LIVE CHAT OVERLAY ══ */
        .sw-overlay {
          position: fixed;
          inset: 0;
          background: #080808;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          color: #ffffff;
          animation: swFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes swFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Header */
        .sw-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .sw-header {
            padding: 32px 48px;
          }
        }

        .sw-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.9);
        }

        .sw-header-title {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .sw-header-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          padding: 4px;
          transition: color 0.3s;
          outline: none;
        }
        .sw-header-close:hover {
          color: #ffffff;
        }

        /* Chat Body */
        .sw-body {
          flex: 1;
          overflow-y: auto;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          scrollbar-width: none;
        }
        .sw-body::-webkit-scrollbar {
          display: none;
        }

        @media (min-width: 768px) {
          .sw-body {
            padding: 64px 80px;
          }
        }

        /* Welcome Container */
        .sw-welcome-container {
          margin-top: auto;
          margin-bottom: auto;
          max-width: 600px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .sw-welcome-title {
          font-family: var(--font-cormorant), serif;
          font-size: 32px;
          font-weight: 300;
          line-height: 1.25;
          letter-spacing: -0.01em;
          color: #ffffff;
        }

        @media (min-width: 768px) {
          .sw-welcome-title {
            font-size: 44px;
          }
        }

        .sw-legal-text {
          font-size: 11px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.45);
          letter-spacing: 0.02em;
        }

        .sw-link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: underline;
          transition: color 0.3s;
        }
        .sw-link:hover {
          color: #ffffff;
        }

        /* Chat History */
        .sw-chat-history {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: auto;
        }

        .sw-msg-row {
          display: flex;
          width: 100%;
        }

        .sw-msg-row.user {
          justify-content: flex-end;
        }

        .sw-msg-row.concierge {
          justify-content: flex-start;
        }

        .sw-msg-bubble {
          max-width: 75%;
          padding: 12px 18px;
          border-radius: 20px;
          font-size: 13px;
          line-height: 1.5;
        }

        .sw-msg-row.user .sw-msg-bubble {
          background: #1c1c1c;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom-right-radius: 4px;
        }

        .sw-msg-row.concierge .sw-msg-bubble {
          background: #0f0f0f;
          color: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom-left-radius: 4px;
        }

        .sw-msg-time {
          display: block;
          font-size: 9px;
          color: rgba(255, 255, 255, 0.35);
          margin-top: 4px;
          text-align: right;
        }

        /* Typing Dots Indicator */
        .sw-typing-dots {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 0;
        }

        .sw-typing-dots span {
          width: 6px;
          height: 6px;
          background-color: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          display: inline-block;
          animation: swBounce 1.4s infinite ease-in-out both;
        }

        .sw-typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .sw-typing-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes swBounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }

        /* Composer */
        .sw-composer {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .sw-composer {
            padding: 24px 80px 40px;
            max-width: 900px;
            width: 100%;
            margin: 0 auto;
            box-sizing: border-box;
            border-top: none;
          }
        }

        .sw-input-wrap {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .sw-input {
          width: 100%;
          height: 48px;
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          padding: 0 48px 0 20px;
          font-family: inherit;
          font-size: 12px;
          color: #ffffff;
          outline: none;
          transition: border-color 0.3s, background-color 0.3s;
        }

        .sw-input:focus {
          border-color: rgba(255, 255, 255, 0.25);
          background: #1a1a1a;
        }

        .sw-input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }

        .sw-send-btn {
          position: absolute;
          right: 16px;
          background: none;
          border: none;
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          transition: opacity 0.3s;
          outline: none;
        }
        .sw-send-btn:hover {
          opacity: 0.8;
        }

        .sw-btn-attach {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.3s, border-color 0.3s;
          outline: none;
          flex-shrink: 0;
        }

        .sw-btn-attach:hover {
          background: #1a1a1a;
          border-color: rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </>
  );
}
