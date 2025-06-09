
"use client";

import { useEffect, useRef } from 'react';

const DonationButtonEmbed = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || scriptRef.current) {
      return;
    }

    const scriptContent = `
(function() {
  function createDonationButton() {
    var btnHtml = '<div style="text-align: center; padding: 20px;">' +
      '<a href="#" id="donateBtn" style="' +
      'display: inline-block;' +
      'text-decoration: none;' +
      'padding: 10px 40px;' +
      'border-radius: 8px;' +
      'background: linear-gradient(to bottom, #ffb347 0%, #ff8c00 100%);' +
      'border: 1px solid #e68a00;' +
      'box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.2);' +
      'color: #1d3557;' +
      'font-family: Arial, sans-serif;' +
      'font-size: 20px;' +
      'font-weight: bold;' +
      'text-shadow: 0 1px 0 rgba(255,255,255,0.4);' +
      'position: relative;' +
      'transition: all 0.2s ease;">' +
      'Deploy Smart Contract' + // Changed text here
      '</a>' +
      '<div style="' +
      'display: flex;' +
      'justify-content: center;' +
      'gap: 10px;' +
      'margin-top: 10px;">' +
      '<img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-01-30%20at%206.54.59%20PM-J4bmaH4ehzubKRj6OtWdjF9y7XylY4.jpeg" alt="Crypto Payment Methods Accepted" style="height: 30px; width: auto;" />' +
      '</div>' +
      '</div>';

    var container = document.getElementById('donation-button-container');
    if (container) {
      container.innerHTML = btnHtml;

      var btn = document.getElementById('donateBtn');
      if (!btn) return;

      btn.addEventListener('mouseover', function() {
        this.style.background = 'linear-gradient(to bottom, #ffc107 0%, #ffb347 100%)';
        this.style.transform = 'translateY(-1px)';
        this.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 5px rgba(0,0,0,0.2)';
      });
      
      btn.addEventListener('mouseout', function() {
        this.style.background = 'linear-gradient(to bottom, #ffb347 0%, #ff8c00 100%)';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.2)';
      });
      
      btn.addEventListener('mousedown', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.2)';
      });
      
      btn.addEventListener('mouseup', function() {
        this.style.transform = 'translateY(-1px)';
        this.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 5px rgba(0,0,0,0.2)';
      });

      btn.addEventListener('click', function(e) {
        e.preventDefault();
        
        if(btn) {
            btn.style.opacity = '0.7';
            btn.textContent = 'Loading...'; // Kept Loading... as it's a generic processing state
        }

        fetch('https://api-v2.payerurl.com/api/donate-payment-request/eyJpdiI6Inh3ZEN0cGZLRy84S0hEb1Y5b1M0OVE9PSIsInZhbHVlIjoiMXdDdWtjTjJsYXY2VzZWZFNuVmpkd2t5Z0t4bWF5YXRyeS9rdU9Sb3dieFI1MURqOWZVK0IvUDNLa0IzVnFTNkxuZXdaTjFydUs3VDl1WEMwWUhEV1E9PSIsIm1hYyI6ImNmM2Q5MWI3ZmZhNGIwM2FhOThjY2UyZWY0YzM4Yzc1MWJmYTFhMGUxNjcwOGE3M2M1ZjgwZWMwNGZiMGU2MzQiLCJ0YWciOiIifQ==', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.status && data.redirectTO) {
            window.location.href = data.redirectTO;
          } else {
            throw new Error('Invalid response from server');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          if (btn) {
            btn.style.opacity = '1';
            btn.textContent = 'Deploy Smart Contract'; // Changed text here
          }
          alert('There was an error processing your request. Please try again.');
        });
      });
    }
  }

  // Since this script is added dynamically, DOM is ready.
  if (document.readyState === 'loading') { // Keep for robustness, though unlikely to be true here
    document.addEventListener('DOMContentLoaded', createDonationButton);
  } else {
    createDonationButton();
  }
})();
    `;

    const newScriptElement = document.createElement('script');
    newScriptElement.type = 'text/javascript';
    newScriptElement.text = scriptContent;
    document.body.appendChild(newScriptElement);
    scriptRef.current = newScriptElement;

    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []); // Empty dependency array ensures this runs once when the component mounts

  return <div id="donation-button-container" ref={containerRef}></div>;
};

export default DonationButtonEmbed;
