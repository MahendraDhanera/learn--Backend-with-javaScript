const asyncHandler = (requestHAndler)=>{
(req,res,next)=> {
    Promise.resolve(requestHAndler(req,res,next))
    .catch((err)=> next(err))
}
}
export default asyncHandler