import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';


export default function Kalender() {
    return (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView='dayGridMonth'
          locale='nl'
          events={[
            { title: 'Vakantie', start: '2026-10-10', end: '2026-10-13', color: '#FF7A00' }
          ]}
        />
      </div>
    );
}

