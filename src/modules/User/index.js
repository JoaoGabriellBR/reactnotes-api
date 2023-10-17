const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const secret = process.env.AUTH_SECRET;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
  async listUsers(req, res) {
    try {
      const response = await prisma.tb_user.findMany({
        where: { deleted_at: null },
        orderBy: { created_at: "desc" },
      });

      res.status(200).json(response);
    } catch (e) {
      console.log(e.message);
    }
  },

  async getUser(req, res) {
    const { userData } = req;

    const response = await prisma.tb_user.findUnique({
      where: { id: parseInt(userData?.id) },
    });

    if (!response) {
      res.status(404).send({ error: "Usuário não encontrado!" });
    } else {
      delete response.password;
      res.status(200).send(response);
    }
  },

  async createUser({ body: { name, email, password } }, res) {
    try {
      if (!name || !email || !password)
        return res
          .status(400)
          .send({ error: "Envie todos os dados solicitados." });

      const userExists = await prisma.tb_user.findFirst({
        where: { email: email },
      });

      if (userExists)
        return res.status(400).send({ error: "Usuário já cadastrado." });

      const hashedPassword = await bcrypt.hash(password, 10);

      const response = await prisma.tb_user.create({
        data: {
          name: name.toUpperCase(),
          email,
          password: hashedPassword,
        },
      });

      return res.status(200).send(response);
    } catch (e) {
      console.log(e.message);
    }
  },

  async updateUser({ body: { name, email }, userData }, res) {
    try {
      const userExists = await prisma.tb_user.findFirst({
        where: { id: parseInt(userData.id) },
      });

      if (!userExists)
        return res.status(404).send({ error: "Usuário não encontrado." });

      const response = await prisma.tb_user.update({
        where: { id: parseInt(userExists.id) },
        data: {
          name: name.toUpperCase(),
          email,
        },
      });

      return res.status(200).send(response);
    } catch (e) {
      console.log(e.message);
    }
  },

  async changePassword({ body: { oldPassword, newPassword }, userData, res }) {
    try {
      const user = await prisma.tb_user.findFirst({
        where: { id: parseInt(userData.id) },
      });
      if (!user) return res.status(401).send({ error: "Usuário inválido" });

      const isPasswordCorrect = await bcrypt.compare(
        oldPassword,
        user.password
      );
      if (!isPasswordCorrect)
        return res.status(401).send({ error: "Senha atual incorreta" });

      await prisma.tb_user.update({
        where: { id: parseInt(user.id) },
        data: {
          password: await bcrypt.hash(newPassword, 10),
        },
      });

      return res.status(200).send({ success: "Senha atualizada." });
    } catch (e) {
      console.log(e.message);
    }
  },

  async deleteUser({ params: { id } }, res) {
    try {
      const userExists = await prisma.tb_user.findFirst({
        where: { id: parseInt(id) },
      });

      if (!userExists)
        return res.status(404).send({ error: "Usuário não encontrado." });

      await prisma.tb_user.delete({
        where: { id: parseInt(userExists.id) },
      });

      return res.status(200).send({ success: "Usuário excluído com sucesso." });
    } catch (e) {
      console.log(e.message);
    }
  },

  async login(
    {
      body: { email, password },
    },
    res
  ) {
    try {
      const user = await prisma.tb_user.findFirst({
        where: { email, deleted_at: null },
      });

      if (!user)
        return res.status(404).send({ error: "Usuário não encontrado." });

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect)
        return res.status(401).send({ error: "Senha Incorreta" });

      const userWithoutPassword = await prisma.tb_user.findFirst({
        where: { email: user.email },
        select: {
          id: true,
          email: true,
          password: false,
        },
      });

      const token = jwt.sign({ ...userWithoutPassword }, secret);
      res.status(200).send({ token, userWithoutPassword });
    } catch (error) {
      console.log(error.message);
    }
  },
};
