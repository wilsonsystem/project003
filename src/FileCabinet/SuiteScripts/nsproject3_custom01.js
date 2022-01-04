/**
 * @NApiVersion 2.1
 */
 define(['N/url','N/https','N/runtime'],function (url,https,runtime) {
    /**
 * @param{runtime} runtime
 */

//------------------ Generation for Gift Card Card by Random Number ------------------------------- 

     const UPPERCASE_CHAR_CODES = arrayFromLowToHigh(65, 90);
     const LOWERCASE_CHAR_CODES = arrayFromLowToHigh(97, 122);
     const NUMBER_CHAR_CODES = arrayFromLowToHigh(48, 57);
     const SYMBOL_CHAR_CODES = arrayFromLowToHigh(33, 47).concat(arrayFromLowToHigh(58, 64)
                      ).concat(arrayFromLowToHigh(91, 96)).concat(arrayFromLowToHigh(123, 126));
     
    function arrayFromLowToHigh(low, high) 
        {
            const array = []
            for (let i = low; i <= high; i++) 
                {
                    array.push(i)
                }
            return array
        }

    function generatePassword(characterAmount, includeUppercase, includeNumbers, includeSymbols) 
 
        {
            let charCodes = LOWERCASE_CHAR_CODES
                
                if (includeUppercase == 'T') 
                    charCodes = charCodes.concat(UPPERCASE_CHAR_CODES);
                if (includeSymbols == 'T') 
                    charCodes = charCodes.concat(SYMBOL_CHAR_CODES);
                if (includeNumbers == 'T') 
                    charCodes = charCodes.concat(NUMBER_CHAR_CODES);
                        
                const passwordCharacters = []
                        
                    for (let i = 0; i < characterAmount; i++) 
                        {
                            const characterCode = charCodes[Math.floor(Math.random() * charCodes.length)]
                            passwordCharacters.push(String.fromCharCode(characterCode))
                        }
                            
                        return passwordCharacters.join('');               
        }


 // Call the Third Parties Serverless Post request to generate the QR code 

    function get_qr_code(Fcode,redeem_url)
        {
            var headersObj= {name:'Content-Type', value:'application/json'};
    
            var url1 = "https://bpo2jhkp5i.execute-api.us-east-1.amazonaws.com?name="

            var url4 = url1 + redeem_url + Fcode;

            var apiResponse=https.post({
                url: url4,
                headers: headersObj
        });
    
            return apiResponse.body;

        }

        return {
            generatePassword: generatePassword, 
            get_qr_code: get_qr_code
        }

    });