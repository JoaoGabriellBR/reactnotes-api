const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const secret = "fo743ybn7834yfo7u4g3ver4f4w487fy4otnw";
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

      const hashedPassword = await bcrypt.hash(password, 10);

      const response = await prisma.tb_user.create({
        data: {
          name: name.toUpperCase(),
          email,
          password: hashedPassword,
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

  async login(req, res) {
    const { email, password } = req.body;

    const user = await prisma.tb_user.findFirst({ where: { email } });

    if (!user || user.deleted_at !== null)
      return res.status(404).send({ error: "Usuário não encontrado!" });

    if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).send({ error: "Senha incorreta!" });

    delete user.password;
    const token = jwt.sign({ ...user }, secret);

    res.status(200).send({ token, user });
  },
};
