export const listReservations = async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany();
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des réservations.' });
  }
};

export const getReservation = async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await prisma.reservation.findUnique({ where: { id: parseInt(id) } });
    reservation ? res.json(reservation) : res.status(404).json({ error: 'Réservation non trouvée.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la réservation.' });
  }
};

export const createReservation = async (req, res) => {
  const { startDate, endDate, totalAmount, status, vehicle_id, customer_id } = req.body;
  try {
    const reservation = await prisma.reservation.create({
      data: { startDate, endDate, totalAmount, status, vehicle_id, customer_id }
    });
    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la réservation.' });
  }
};

export const updateReservation = async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, totalAmount, status, vehicle_id, customer_id } = req.body;
  try {
    const reservation = await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: { startDate, endDate, totalAmount, status, vehicle_id, customer_id }
    });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la réservation.' });
  }
};

export const deleteReservation = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.reservation.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Réservation supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la réservation.' });
  }
};
