const asyncHandler = (requestHandler) => {
  return(req,res,next)=>{ 
    Promise.resolve(requestHandler(req,res,next))
     .catch((error)=>(next(error)))
  }
}
 // it is as simple as  we are passing  an asynchronous function
 // and it can be anything either api call or middleware anything
 // it will be passed into asyncHandler and everytime it will return
 // resolved promise or error

 // it can be interpretated as
  // const asyncHandler =(fn)={async (req,res,next)=>{
  //  try{ 
  //       await fn(req,res,next)
  //     }.catch(error){
  //       res.status(err.code || 500)
  //     success:false }
  //}}
export {asyncHandler}