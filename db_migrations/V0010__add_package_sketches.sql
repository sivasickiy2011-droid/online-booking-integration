-- Добавляем SVG-схемы для визуализации шаблонов стеклянных изделий

UPDATE t_p56372141_online_booking_integ.glass_packages 
SET sketch_svg = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="30" width="160" height="140" fill="none" stroke="#0ea5e9" stroke-width="2"/><line x1="100" y1="30" x2="100" y2="170" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 2"/><rect x="85" y="50" width="30" height="80" fill="none" stroke="#0ea5e9" stroke-width="3" rx="2"/><circle cx="92" cy="90" r="3" fill="#f59e0b"/><text x="100" y="195" text-anchor="middle" font-size="10" fill="#64748b">Дверь на стекле</text></svg>'
WHERE package_id = 39;

UPDATE t_p56372141_online_booking_integ.glass_packages 
SET sketch_svg = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="30" width="160" height="140" fill="none" stroke="#0ea5e9" stroke-width="2"/><line x1="100" y1="30" x2="100" y2="170" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 2"/><rect x="15" y="50" width="35" height="80" fill="none" stroke="#0ea5e9" stroke-width="3" rx="2"/><circle cx="45" cy="90" r="3" fill="#f59e0b"/><text x="100" y="195" text-anchor="middle" font-size="10" fill="#64748b">Дверь на стене</text></svg>'
WHERE package_id = 38;