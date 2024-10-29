const contractController = {
  addContract: async (req, res) => {
    const {
      startDate,
      endDate,
      totalAmount,
      status,
      vehicle_id,
      customer_id,
      user_id,
      reservation_id,
    } = req.body;

    try {
      const contract = await prisma.contract.create({
        data: {
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          totalAmount,
          status,
          vehicle_id,
          customer_id,
          user_id,
          reservation_id,
        },
      });
      return res
        .status(201)
        .json({ message: 'Contract created successfully.', contract });
    } catch (error) {
      console.error('Error creating contract:', error);
      return res
        .status(500)
        .json({
          error:
            'An error occurred while creating the contract. Please try again.',
        });
    }
  },

  updateContract: async (req, res) => {
    const { id } = req.params;
    const {
      startDate,
      endDate,
      totalAmount,
      status,
      vehicle_id,
      customer_id,
      user_id,
      reservation_id,
    } = req.body;

    try {
      const contract = await prisma.contract.findUnique({
        where: { id: parseInt(id) },
      });
      if (!contract)
        return res
          .status(404)
          .json({
            error: 'Contract not found. Please provide a valid contract ID.',
          });

      const updatedContract = await prisma.contract.update({
        where: { id: parseInt(id) },
        data: {
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          totalAmount,
          status,
          vehicle_id,
          customer_id,
          user_id,
          reservation_id,
        },
      });
      return res
        .status(200)
        .json({ message: 'Contract updated successfully.', updatedContract });
    } catch (error) {
      console.error('Error updating contract:', error);
      return res
        .status(500)
        .json({
          error:
            'An error occurred while updating the contract. Please try again.',
        });
    }
  },

  deleteContract: async (req, res) => {
    const { id } = req.params;

    try {
      const contract = await prisma.contract.findUnique({
        where: { id: parseInt(id) },
      });
      if (!contract)
        return res
          .status(404)
          .json({
            error: 'Contract not found. Please provide a valid contract ID.',
          });

      await prisma.contract.delete({ where: { id: parseInt(id) } });
      return res
        .status(200)
        .json({ message: 'Contract deleted successfully.' });
    } catch (error) {
      console.error('Error deleting contract:', error);
      return res
        .status(500)
        .json({
          error:
            'An error occurred while deleting the contract. Please try again.',
        });
    }
  },

  getAllContracts: async (req, res) => {
    try {
      const contracts = await prisma.contract.findMany({
        include: {
          vehicle: true,
          customer: true,
          user: true,
          reservation: true,
        },
      });
      return res.status(200).json(contracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      return res
        .status(500)
        .json({
          error:
            'An error occurred while fetching contracts. Please try again.',
        });
    }
  },

  getContractById: async (req, res) => {
    const { id } = req.params;
    try {
      const contract = await prisma.contract.findUnique({
        where: { id: parseInt(id) },
        include: {
          vehicle: true,
          customer: true,
          user: true,
          reservation: true,
        },
      });
      if (!contract)
        return res
          .status(404)
          .json({
            error: 'Contract not found. Please provide a valid contract ID.',
          });

      return res.status(200).json(contract);
    } catch (error) {
      console.error('Error fetching contract:', error);
      return res
        .status(500)
        .json({
          error:
            'An error occurred while fetching the contract. Please try again.',
        });
    }
  },
};

export default contractController;
