-- Обновляем эскиз шаблона: дверь от пола, не форточка

UPDATE t_p56372141_online_booking_integ.glass_packages 
SET sketch_svg = '<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Основное стекло -->
  <rect x="50" y="20" width="200" height="350" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="3" rx="4"/>
  
  <!-- Дверь от ПОЛА вверх (желтая) -->
  <rect x="110" y="120" width="80" height="250" fill="#fef3c7" stroke="#f59e0b" stroke-width="4" rx="3"/>
  
  <!-- Петли слева -->
  <rect x="115" y="160" width="12" height="25" fill="#78716c" stroke="#44403c" stroke-width="2" rx="3"/>
  <rect x="115" y="310" width="12" height="25" fill="#78716c" stroke="#44403c" stroke-width="2" rx="3"/>
  
  <!-- Ручка справа -->
  <rect x="178" y="230" width="6" height="60" fill="#57534e" stroke="#292524" stroke-width="1.5" rx="3"/>
  
  <!-- Линия пола -->
  <line x1="30" y1="370" x2="270" y2="370" stroke="#1e293b" stroke-width="3" stroke-dasharray="8,4"/>
  <text x="25" y="390" font-size="14" fill="#1e293b" font-weight="600">ПОЛ</text>
  
  <!-- Стрелка входа -->
  <text x="150" y="400" text-anchor="middle" font-size="18" fill="#f59e0b" font-weight="bold">↑ ВХОД</text>
  
  <text x="150" y="15" text-anchor="middle" font-size="12" fill="#64748b">Дверь от пола</text>
</svg>'
WHERE package_id = 39;

UPDATE t_p56372141_online_booking_integ.glass_packages 
SET sketch_svg = '<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Основное стекло -->
  <rect x="50" y="20" width="200" height="350" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="3" rx="4"/>
  
  <!-- Дверь от ПОЛА вверх слева у стены -->
  <rect x="50" y="120" width="80" height="250" fill="#fef3c7" stroke="#f59e0b" stroke-width="4" rx="3"/>
  
  <!-- Петли на стене (слева от двери) -->
  <rect x="42" y="160" width="12" height="25" fill="#78716c" stroke="#44403c" stroke-width="2" rx="3"/>
  <rect x="42" y="310" width="12" height="25" fill="#78716c" stroke="#44403c" stroke-width="2" rx="3"/>
  
  <!-- Ручка справа -->
  <rect x="118" y="230" width="6" height="60" fill="#57534e" stroke="#292524" stroke-width="1.5" rx="3"/>
  
  <!-- Линия пола -->
  <line x1="30" y1="370" x2="270" y2="370" stroke="#1e293b" stroke-width="3" stroke-dasharray="8,4"/>
  <text x="25" y="390" font-size="14" fill="#1e293b" font-weight="600">ПОЛ</text>
  
  <!-- Стрелка входа -->
  <text x="90" y="400" text-anchor="middle" font-size="18" fill="#f59e0b" font-weight="bold">↑ ВХОД</text>
  
  <text x="150" y="15" text-anchor="middle" font-size="12" fill="#64748b">Дверь на стене</text>
</svg>'
WHERE package_id = 38;
