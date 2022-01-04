/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
 define(['N/record', 'N/redirect', 'N/search', 'N/ui/serverWidget', 'N/url','N/file','N/email', 'N/runtime'],
 /**
* @param{record} record
* @param{redirect} redirect
* @param{search} search
* @param{serverWidget} serverWidget
* @param{url} url
*/
 (record, redirect, search, serverWidget, url,file,email, runtime) => {
     /**
      * Defines the Suitelet script trigger point.
      * @param {Object} scriptContext
      * @param {ServerRequest} scriptContext.request - Incoming request
      * @param {ServerResponse} scriptContext.response - Suitelet response
      * @since 2015.2
      */
     const onRequest = (context) => {

         var request = context.request;
         var response = context.response;

         if (request.method == 'GET')
         {
                 sales_order_id =            request.parameters.sales_order_id;
                 Generated_code_detail =     request.parameters.Generated_code_detail;
                 Gerenated_code_qty =        request.parameters.Gerenated_code_qty;
                 Redeem_line_qty    =        request.parameters.Redeem_line_qty;
                 Redeem_line_detail =        request.parameters.Redeem_line_detail;
                 Total_line_qty     =        request.parameters.Total_line_qty;
                 error_note         =        request.parameters.error_note;
                 var memo_input     = "";

                 if (error_note == 0 && Redeem_line_qty > 0)
                 {

                  Reeedm_line_array = Redeem_line_detail.split('-');

                  Generated_code_array = Generated_code_detail.split('-');
                  
                  //-------------- Write the Memo and Is Generated Fields in Sales Order ---------------------
                  
                 for (i=0; i < Gerenated_code_qty; i++)
                     { memo_input = "/ Gift Card id:" + Generated_code_array[i] + memo_input ;} 
                 
                 var rec = record.load({type: 'salesorder', id: sales_order_id, isDynamic: true });
                           rec.setValue({fieldId: 'memo', value: memo_input});

                 var Tran_id = rec.getValue('tranid');
                 var Customer_Name = rec.getText('entity');
                 var Customer_Email = rec.getValue('custbody_p3_transaction_body_01');


                 for (i=0; i < Total_line_qty; i++)
                 
                 {
                     if(Reeedm_line_array[i] == 'T')

                     {
                         rec.selectLine({ sublistId: 'item', line: i });
                 
                         rec.setCurrentSublistValue({sublistId:  'item', fieldId:'custcol_p3_transaction_item_03',value: true,});
                 
                         rec.commitLine ({ sublistId: 'item', line: i }); 
                     } 

                 }
                 
                 rec.save();

                 // ---------------Generate QR Code Files in the File Cabinet ---------

                 log.debug(Generated_code_array);
                 
                 var file_content  = "Please Show the QR for the Shopkeeper for Redeeption! <br><br>";
         
                 for (i=0; i < Gerenated_code_qty; i++) 
                 {
                     var rec1 = record.load({type: 'customrecord_nsproject3_table1_gift_card',id: Generated_code_array[i], isDynamic : true});
                     
                     var qrcode_img = rec1.getValue('custrecord_p3_table1_code_source1');
                     var qrcode_name = rec1.getValue('custrecord_p3_table1_item_name');

                     file_content = file_content + qrcode_img + '<br>'+ qrcode_name +'<br>'

                 }
                 //---------------Create the Files -------------------------------------------------------

                 var caseSearch3 = search.create({
                    type: 'folder',
                    title: 'Find the internal id of folder ID',
                    
                    filters: [
                                search.createFilter({name: 'name', operator: search.Operator.IS, values: 'qrcode'})            
                             ],
                    columns:[search.createColumn({name:'internalid'}),] 
                });
            
                    var searchResults = caseSearch3.run().getRange({start:  0, end: 1});
             
                    var folder_id =  searchResults[0].id;
                 
                 var file_name = 'qrcode_for_so' + Tran_id + '.html';

                 var fileObj = file.create({
                     name: file_name,
                     fileType: file.Type.HTMLDOC,
                     contents: '<html><body>'+ file_content +'</body><html>',
                     description: 'QR code',
                     encoding: file.Encoding.UTF8,
                     folder: folder_id,
                     isOnline: true
                 });

                 let f_id = fileObj.save();
                
                 let fileObj1 = file.load({id: f_id});
                 
                 //---------------Send Email  ---------------------

                 var subject_content = "Merry Christmas! Donut Gift Card QRCode For Sales Order" +  Tran_id ;
                 var body_content    = "Dear " + Customer_Name + ":<br><br> Thank you for purchase our gift Card. <br> Your Sales Order is:" +
                                       Tran_id + "<br> Please Download the attached QR code for Redemption!"

                 email.send({

                     author: runtime.getCurrentUser().id,
                     recipients: Customer_Email,
                     subject: subject_content,
                     body: body_content,
                     attachments: [fileObj1]
                 });

                 //-----------------------------------------------

                 redirect.toRecord({
                     type: 'salesorder', 
                     id:   sales_order_id
                 });
                 
                 } else response.write('Error, Not enough of Gift Card, please check the Sales Order and Gift Cards');
         }

     }

     return {onRequest}

 });
