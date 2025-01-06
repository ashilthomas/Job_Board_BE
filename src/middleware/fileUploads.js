import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads'); // Directory to store resumes
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
// const upload = multer({ storage });
const upload = multer({
    storage: storage,
   
  });
  

export default upload