import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { deleteParking, getParkings } from '../api/parkings';
import ParkingList from '../components/ParkingList';

const AdminParkings = () => {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getParkings();
        setParkings(result.data);
      } catch (error) {
        toast.error('Errore durante il caricamento dei parcheggi');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteParking(id);
      setParkings(parkings.filter((parking) => parking.id !== id));
      toast.success('Parcheggio eliminato con successo');
    } catch (error) {
      toast.error('Errore durante l\'eliminazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Gestione Parcheggi</h1>
      {loading ? (
        <p>Caricamento in corso...</p>
      ) : (
        <ParkingList parkings={parkings} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default AdminParkings;