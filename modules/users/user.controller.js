import {
    createUserService,
    findUserForLoginService,
    getUsernameService,
} from "./user.service.js";

export const createUserController = async (req, res) => {
  try {
    const { name, firstLastName, secondLastName, email, password } = req.body;
    const newUser = await createUserService({
      name,
      firstLastName,
      secondLastName,
      email,
      password,
    });

    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
export const getUsernameController = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username?.trim()) {
      return res.status(400).json({ message: "El username es obligatorio" });
    }

    const user = await getUsernameService(username);

    if (!user) {
      return res.status(404).json({ message: "El usuario no existe" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const findUserForLoginController = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        message: "Username y contraseña son obligatorios",
      });
    }
    const user = await findUserForLoginService(username, password);
    if (!user) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
