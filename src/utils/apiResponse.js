class apiResponse{
  constructor(statusCode,data,message){
    this.statusCode=statusCode
    this.data=data
    this.message=message
    this.success=statusCode<400
    // statusCode shit
    // infromational response (100-199)
    // successful response (200-299)
    // redirection message (300-399)
    // client error responses (400-499)
    // Server error responses (500-599)
  }

}
export {apiResponse}