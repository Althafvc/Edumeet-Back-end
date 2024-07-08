// exports.otp  = parseInt(Math.random()*10000)

 function otpGenerator(){
        // Generating a random number between 0 and 9999
        randomOTP = Math.floor(Math.random() * 10000)
        if ( randomOTP < 1000 ) {
            return randomOTP = randomOTP + 1000
        } else {
            return randomOTP
        }   
    }

    exports.otp =otpGenerator()