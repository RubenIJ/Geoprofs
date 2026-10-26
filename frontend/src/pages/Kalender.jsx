<<<<<<< Updated upstream
export default function Kalender() {
    return (
        <div className="p-8">
            <h1>wat een mooie kalender</h1>
        </div>
    );
=======
// src/pages/Kalender.jsx
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import React, { useEffect, useState } from 'react';

export default function Kalender() {
  const [huidigeGebruiker, setHuidigeGebruiker] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('geoprofs_user');
    if (storedUser) {
      setHuidigeGebruiker(JSON.parse(storedUser));
    }
  }, []);

  const calendarEvents = huidigeGebruiker?.verlofHistorie ? huidigeGebruiker.verlofHistorie.map(verlof => ({
    title: `${verlof.type} (${verlof.status})`,
    start: verlof.startDatum,
    end: verlof.eindDatum,
    // Dynamische kleur op basis van de status
    backgroundColor: verlof.status === 'Goedgekeurd' ? '#10B981' : '#F59E0B',
    classNames: ['rounded-md', 'px-2', 'py-1', 'shadow-sm', 'border-0', 'font-medium', 'text-xs'],
    extendedProps: {
      opmerking: verlof.opmerking,
      uren: verlof.uren
    }
  })) : [];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView='dayGridMonth'
        locale='nl'
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        events={calendarEvents}
      />
    </div>
  );
>>>>>>> Stashed changes
}