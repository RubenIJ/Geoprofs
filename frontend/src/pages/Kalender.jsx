import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function Kalender() {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function haalVerlofAanvragenOp() {
      try {
        setLoading(true);

        // Haal de data op inclusief de juiste kolomnaam 'beschrijving'
        const { data, error } = await supabase
          .from('verlofaanvragen')
          .select(`
            id,
            startdatum,
            einddatum,
            status_id,
            medewerker_id,
            verlofredenen ( beschrijving )
          `);

        if (error) throw error;

        // Map de data naar FullCalendar events
        const events = data.map(verlof => {
          const isGoedgekeurd = verlof.status_id === 2;

          // Pakt netjes 'beschrijving' uit de relational join
          const redenNaam = verlof.verlofredenen?.beschrijving || 'Verlof';

          return {
            id: verlof.id,
            title: redenNaam,
            start: verlof.startdatum,
            end: verlof.einddatum,
            backgroundColor: isGoedgekeurd ? '#10B981' : '#F59E0B',
            borderColor: isGoedgekeurd ? '#059669' : '#D97706',
            classNames: ['rounded-md', 'px-2', 'py-1', 'shadow-sm', 'font-medium', 'text-xs'],
            extendedProps: {
              medewerkerId: verlof.medewerker_id,
              statusId: verlof.status_id
            }
          };
        });

        setCalendarEvents(events);
      } catch (err) {
        console.error('Fout bij ophalen kalenderdata:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    haalVerlofAanvragenOp();
  }, []);

  if (loading) return <p className="p-6">Kalender laden...</p>;
  if (error) return <p className="p-6 text-red-600">Fout bij laden: {error}</p>;

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
}