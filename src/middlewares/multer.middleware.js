import multer from "multer"
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
  // TO make assign every file a unique name using crypto then
  //  crypto.randomBytes(12,function(err,name){
  //  const fn = name.toString("hex") + path.extname(file.originalname)
   // cb(null,fn)
   //})
   cb(null,file.originalname)
  }
})

const upload = multer({ 
   storage, 
})
export {upload}