const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  async listUsers(req, res) {
    try {
      const response = await prisma.tb_user.findMany({
        where: { deleted_at: null },
        orderBy: { created_at: "desc" },
      });

      res.status(200).json(response);
    } catch (error) {
      res.status(500).send(error.message);
      console.log(error.message);
    }
  },

  async getUser(req, res) {
    try {
      const { id } = req.params;

      const response = await prisma.tb_user.findUnique({
        where: { id: parseInt(id) },
      });

      if (!response)
        return res.status(404).send({ error: "Usuário não encontrado" });

      res.status(200).json(response);
    } catch (e) {
      console.log(e.message);
      res.status(500).send(e.message);
    }
  },

  async createUser(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password)
        return res.status(400).json({
          error: "Por favor, envie todos os dados solicitados!",
        });

      const userExists = await prisma.tb_user.findFirst({
        where: { email: email },
      });

      if (userExists)
        return res.status(400).json({ error: "Usuário já cadastrado" });

      const response = await prisma.tb_user.create({
        data: {
          name: name.toUpperCase(),
          email,
          password,
        },
      });

      res.status(200).json(response);
    } catch (e) {
      console.log(e.message);
    }
  },

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, password } = req.body;

      const userExists = await prisma.tb_user.findFirst({
        where: { id: parseInt(id) },
      });

      if (!userExists)
        return res.status(404).send({ error: "Usuário não encontrado" });

      const response = await prisma.tb_user.update({
        where: { id: parseInt(userExists.id) },
        data: {
          name: name.toUpperCase(),
          email,
          password,
        },
      });

      res.status(200).json(response);
    } catch (e) {
      console.log(e.message);
      res.status(500).send(e.message);
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const userExists = await prisma.tb_user.findFirst({
        where: { id: parseInt(id) },
      });

      if (!userExists)
        return res.status(404).send({ error: "Usuário não encontrado" });

      const response = await prisma.tb_user.delete({
        where: { id: parseInt(userExists.id) },
      });

      res
        .status(200)
        .send(response, { success: "Usuário excluído com sucesso" });
    } catch (e) {
      console.log(e.message);
    }
  },
};
