import jwt from "jsonwebtoken";
import "dotenv/config";

function authenticateUser(req, res, next) {


  const token = req.cookies.token ||  req.headers.authorization?.split(' ')[1];;


//   const token = req.headers.authorization;

  
 
 
  if (!token) {
   
    return res.status(401).json({
      succes:false,
      message:"Unauthorized"
    })
  }


  jwt.verify(token, process.env.SKT, (err, user) => {
    

    if (err) return res.status(403).json({
      succes:false,
      message:"Token expired"
    })
    
    req.user = user;

    next();
  });
}

export default authenticateUser;
