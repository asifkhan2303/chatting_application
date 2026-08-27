import jwt from "jsonwebtoken"
export const generateToken = (userId, res) => {
  //   const token
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "8d",
  });

  res.cookie("jwt", token, {
    maxAge: 8 * 24 * 60 * 60 * 1000,
    httpOnly: true, //cookie is not accessible by client side javascript
    sameSite: "strict", //cookie is only sent to the same site as the one that originated it
    secure: process.env.NODE_ENV !== "development" ? true : false, //cookie will only be sent over https
  });
  return token;
};
