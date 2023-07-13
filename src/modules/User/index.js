const { PrismaClient } = require("@prisma/client");
const { responseStatus } = require('../../utils/responseStatus');

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

  async createUser({ body: { name, email, password } } ) {
    try {
      if (!name || !email || !password)
        return responseStatus(
          400,
          "Envie todos os dados solicitados",
          "error",
        );

      const userExists = await prisma.tb_user.findFirst({
        where: { email: email },
      });

      if (userExists) return responseStatus(400, 'Usuário já cadastrado.', 'error');

      const hashedPassword = await bcrypt.hash(password, 10);

      const response = await prisma.tb_user.create({
        data: {
          name: name.toUpperCase(),
          email,
          password: hashedPassword,
        },
      });

      return responseStatus(200, response);
    } catch (e) {
      console.log(e.message);
    }
  },

  async updateUser({ body: { name, email }, userData }) {
    try {
      const userExists = await prisma.tb_user.findFirst({
        where: { id: parseInt(userData.id) },
      });

      if (!userExists)
        return responseStatus(404, "Usuário não encontrado.", "error");

      const response = await prisma.tb_user.update({
        where: { id: parseInt(userExists.id) },
        data: {
          name: name.toUpperCase(),
          email,
        },
      });

      return responseStatus(200, response);
    } catch (e) {
      console.log(e.message);
    }
  },

  async changePassword({ body: { oldPassword, newPassword }, userData }) {
    try {
      const user = await prisma.tb_user.findFirst({
        where: { id: parseInt(userData.id) },
      });

      if (!user) return responseStatus(401, "Usuário inválido.", "error");

      const isPasswordCorrect = await bcrypt.compare(
        oldPassword,
        user.password
      );
      if (!isPasswordCorrect)
        return responseStatus(401, "Senha atual incorreta.", "error");

      await prisma.tb_user.update({
        where: { id: parseInt(user.id) },
        data: {
          password: await bcrypt.hash(newPassword, 10),
        },
      });

      return responseStatus(200, "Senha atualizada.", "success");
    } catch (e) {
      console.log(e.message);
    }
  },

  async deleteUser({ params: { id } }) {
    try {
      const userExists = await prisma.tb_user.findFirst({
        where: { id: parseInt(id) },
      });

      if (!userExists)
        return responseStatus(404, "Usuário não encontrado.", "error");

      await prisma.tb_user.delete({
        where: { id: parseInt(userExists.id) },
      });

      return responseStatus(200, "Usuário excluído com sucesso.", "success");
    } catch (e) {
      console.log(e.message);
    }
  },

  async login({ body: { email, password } }) {
    try {
      const user = await prisma.tb_user.findFirst({
        where: { email, deleted_at: null },
      });

      if (!user) return responseStatus(404, "Usuário não encontrado!", "error");

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect)
        return responseStatus(401, "Senha incorreta", "error");

      const userWithoutPassword = await prisma.tb_user.findFirst({
        where: { email: user.email },
        select: {
          id: true,
          email: true,
          password: false,
        },
      });

      const token = jwt.sign({ ...userWithoutPassword }, secret);
      return responseStatus(200, { token, userWithoutPassword });
    } catch (error) {
      console.log(error.message);
    }
  },
};
