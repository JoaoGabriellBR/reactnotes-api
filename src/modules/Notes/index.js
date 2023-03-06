const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  async listNotes(req, res) {
    try {
      const { userData } = req;

      const totalCount = await prisma.tb_notes.count({
        where: { deleted_at: null },
      });

      const response = await prisma.tb_notes.findMany({
        where: { deleted_at: null, id_author: parseInt(userData.id) },
        orderBy: { created_at: "desc" },
        take: parseInt(totalCount),
        include: {
          tb_user: true,
        },
      });

      if (!response.length) {
        return res
          .status(404)
          .send({ error: "Não foi possível encontrar quaisquer nota!" });
      }

      response?.map((res) => {
        res.author = res.tb_user;
        delete res.tb_user;
      });

      res.status(200).send({ totalCount, response });
    } catch (e) {
      console.log(e.message);
    }
  },

  async getNote(req, res) {
    try {
      const { id } = req.params;

      const exist = await prisma.tb_notes.findFirst({
        where: { id: parseInt(id) },
      });

      if (!exist) {
        return res.status(404).send({ error: "Nota não encontrada!" });
      }

      const response = await prisma.tb_notes.findUnique({
        where: { id: parseInt(id)},
        include: {
          tb_user: true,
        },
      });

      delete response.tb_user.password;
      response.author = response.tb_user;
      delete response.tb_user;

      res.status(201).json(response);
    } catch (e) {
      console.log(e.message);
    }
  },

  async createNote(req, res) {
    try {
      const { title, content } = req.body;
      const { userData } = req;

      if (!title || !content) {
        return res
          .status(400)
          .send({ error: "Envie todos os dados solicitados!" });
      }

      const response = await prisma.tb_notes.create({
        data: {
          title: title,
          content: content,
          tb_user: { connect: { id: userData.id } },
        },
      });

      res.status(201).json(response);
    } catch (e) {
      console.log(e.message);
    }
  },

  async updateNote(req, res) {
    try {
      const { id } = req.params;
      const { title, content } = req.body;

      const exist = await prisma.tb_notes.findFirst({
        where: { id: parseInt(id) },
      });

      if (!exist) {
        return res.status(404).send({ error: "Nota não encontrada!" });
      }

      const response = await prisma.tb_notes.update({
        where: { id: parseInt(id) },
        data: {
          title: title,
          content: content,
        },
        include: {
          tb_user: true,
        },
      });

      delete response.tb_user.password;
      response.author = response.tb_user;
      delete response.tb_user;

      res.status(201).json(response);
    } catch (e) {
      console.log(e.message);
    }
  },

  async deleteNote(req, res){
    const { id } = req.params;

    const exist = await prisma.tb_notes.findFirst({
      where: { id: parseInt(id) },
    });

    if (!exist) {
      return res.status(404).send({ error: "Nota não encontrada!" });
    }

    const response = await prisma.tb_notes.update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() }
    });

    res.status(200).send(response);
  }
};
