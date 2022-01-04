/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
 define(['N/record', 'N/redirect', 'N/runtime', 'N/search', 'N/ui/serverWidget','N/format','N/url'],
 /**
* @param{record} record
* @param{redirect} redirect
* @param{runtime} runtime
* @param{search} search
* @param{serverWidget} serverWidget
*/
 (record, redirect, runtime, search, serverWidget,format,url) => {
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

         //------ Get incoming request parameter from Get method ------------

             var code = 0;
             code =  request.parameters.code; 


         //------ Search out the Gift Card Transaction from saved search -----------

             var caseSearch = search.create({
                 type: 'customrecord_nsproject3_table1_gift_card',
                 title: 'Finding my Code',
                 
                 filters: [
                                    
                    search.createFilter({
                      name:     'custrecord_p3_table1_so_number', 
                      operator:  search.Operator.ISNOTEMPTY
                      
                    }),

                    search.createFilter({
                     name:     'custrecord_p3_table1_code', 
                     operator:  search.Operator.IS,
                     values:    code
                   })
 
                    ],
                 
                 columns:[

                     search.createColumn({name:'custrecord_p3_table1_item_name'}),
                     search.createColumn({name:'custrecord_p3_table1_expire_date'}),
                     search.createColumn({name:'custrecord_p3_table1_eligible'}),
                     search.createColumn({name:'custrecord_p3_table1_redeem'}),
                     search.createColumn({name:'custrecord_p3_table1_so_number'}),
                     search.createColumn({name:'custrecord_p3_table1_item_image'}),
                     search.createColumn({name:'custrecord_p3_table1_item'}),
                     search.createColumn({name:'custrecord_p3_table1_so'}),
                 ] 
                 });
         
                 var searchResults = caseSearch.run().getRange({ start: 0, end: 1});
 
                 
                 if (searchResults.length == 0)
                     
                     response.write(' *** The Gift Card Code is invalid or not activated! (error code 001)***')

                 else 

                 {
                         var cardId = searchResults[0].id;

                         var item = searchResults[0].getValue({name:'custrecord_p3_table1_item_name'});
                         var item_code = searchResults[0].getValue({name:'custrecord_p3_table1_item'});
                         var expDate = searchResults[0].getValue({name:'custrecord_p3_table1_expire_date'});
                         var eligible= searchResults[0].getValue({name:'custrecord_p3_table1_eligible'});
                         var redeem = searchResults[0].getValue({name:'custrecord_p3_table1_redeem'});
                         var org_so_num = searchResults[0].getValue({name:'custrecord_p3_table1_so_number'});
                         var org_so_internal_id = searchResults[0].getValue({name:'custrecord_p3_table1_so'});
                         var image = searchResults[0].getValue({name:'custrecord_p3_table1_item_image'});
                         var image_url = searchResults[0].getText({name:'custrecord_p3_table1_item_image'});
                         log.debug({title: 'sales order no.', details: org_so_num});

          //---------- Validation the Gift Card Code ----------------------------------------------------------------
                 
                  if (eligible == false)
                      response.write(' *** The Gift Card Code is not eligible! (error code 002)***')
                 
                  if (redeem == true)
                      response.write(' *** The Gift Card Code is already redeem! (error code 003)***')
                 
                     var currentDate = new Date ();
                     var check_date = format.parse({value: expDate, type:format.Type.DATE});

                  if (check_date < currentDate)
                      response.write(' *** The Gift Card Code is already expired (error code 004) ***')
 
         //---------- Create the Entry Form to double check the Sales order Number -------       
             
                 if ( eligible == true && redeem == false && check_date > currentDate) 
                     
                     {
                         var form = serverWidget.createForm({title: 'Gift Card Redemption', hideNavBar: true });
                         var fieldgroup1 = form.addFieldGroup({id : 'basicgroup',label : 'Please check:'});
                         fieldgroup1.isSingleColumn = true;


                         var nameFld  = form.addField({
                             id: 'custpage_p3_valid_item',
                             type: serverWidget.FieldType.TEXT,
                             label: 'Your Gift Card item is: ',
                             container : 'basicgroup' 
                         });
                         
                         nameFld.defaultValue = item;
                         nameFld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
    
         //----------Search the Link of the File and phone --------- 
                     
                         function field_to_url(image_url)
                         
                         {
                                 var image_link = image_url 
                                 var image_link = 'http://'+runtime.accountId+'.app.netsuite.com/'+ image_link;
                                 log.debug({title: 'image link 2', details: image_link});
                             
                             return image_link;

                         }

         //------------------------------------------------------------------------------------
                       
                         var imageFld  = form.addField({
                             id: 'custpage_p3_image',
                             type: serverWidget.FieldType.INLINEHTML,
                             label: 'Gift Image',
                             container : 'basicgroup' 
                         });

                         var image_tag = '<br><img src="' + field_to_url(image_url) + '"height="100"/><br>';
                         imageFld.defaultValue = image_tag; 

                         var locationFld=form.addField({
                             id: 'custpage_p3_location',
                             type: serverWidget.FieldType.SELECT,
                             label: 'Shop',
                             source: 'location',
                             container : 'basicgroup',
                         });

                         var input_soFld  = form.addField({
                             id: 'custpage_p3_input_so',
                             type: serverWidget.FieldType.TEXT,
                             label: 'Please entry the Sales Order Number: ',
                             container : 'basicgroup',
                            
                         });
         
          //-------------------Pass backend Information ------------------------------------------------------               

                         var itemIdFld  = form.addField({
                             id: 'custpage_p3_item_id',
                             type: serverWidget.FieldType.TEXT,
                             label: 'Original Id',
                             container : 'basicgroup',
                         });

                             itemIdFld.defaultValue = item_code;
                             itemIdFld.updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});

                         var check_so1Fld  = form.addField({
                                 id: 'custpage_p3_org_so_internal',
                                 type: serverWidget.FieldType.TEXT,
                                 label: 'Internal Sales Order Number',
                                 container : 'basicgroup',
                             });
                                 check_so1Fld.defaultValue = org_so_internal_id;
                                 check_so1Fld.updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});                


                         var check_soFld  = form.addField({
                             id: 'custpage_p3_org_so',
                             type: serverWidget.FieldType.TEXT,
                             label: 'Original Sales order Document number',
                             container : 'basicgroup',
                         });

                             check_soFld.defaultValue = org_so_num;
                             check_soFld.updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});


                         var card_Fld  = form.addField({
                             id: 'custpage_p3_card',
                             type: serverWidget.FieldType.TEXT,
                             label: 'card ID ',
                             container : 'basicgroup',
                     
                         });

                             card_Fld.defaultValue = cardId;
                             card_Fld.updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
                         
         //------------------------------------------------------------------------------------

                         form.addSubmitButton('Valid the Gift Card'); 
                         response.writePage(form);    
                     }
                 }
     }
     else //POST 
     {
         var rlocation = 0;

         card_code           = request.parameters.custpage_p3_card;
         item_code           = request.parameters.custpage_p3_item_id;
         rlocation           = request.parameters.custpage_p3_location;
         org_so              = request.parameters.custpage_p3_org_so;
         org_so_internal     = request.parameters.custpage_p3_org_so_internal;
         input_so            = request.parameters.custpage_p3_input_so;

         //-------------Get the Conversion Items-------------------------

         var caseSearch = search.create({
             type: 'item',
             title: 'item finder',
             filters: [ search.createFilter({ name: 'internalid', operator:  search.Operator.IS, values: item_code })],
             columns:[search.createColumn({name:'custitem_p3_item_02'}),search.createColumn({name:'custitem_p3_item_03'})] 
             });

             var searchResults = caseSearch.run().getRange({ start: 0, end: 1});
             var converse_item = searchResults[0].getValue({name:'custitem_p3_item_02'});
             var converse_qty =  searchResults[0].getValue({name:'custitem_p3_item_03'});

         //----------Validation the Input----------------------------

         if (rlocation == 0)
             response.write(" *** Plaese select the Location! ***");

         if (org_so != input_so && org_so!= 0 && input_so!= 0)
          {
             response.write(" *** Wrong Sales Order Number, please entry again (error code 005)*** ");
          }
     
         if (org_so == input_so && org_so!= 0 && input_so!= 0 && rlocation != 0)
         {   

         //-------------Update the Gift Card Record ----------------------------

             var rec = record.load({type: 'customrecord_nsproject3_table1_gift_card',id: card_code, isDynamic : true});
             
             rec.setValue({fieldId: 'custrecord_p3_table1_redeem', value: true});
             rec.setValue({fieldId: 'custrecord_p3_table1_shop', value: rlocation});
             rec.setValue({fieldId: 'custrecord_p3_table1_redeem_emp', value: runtime.getCurrentUser().id});
             rec.save();

         //-------------Update the Sales Order --------------------------------

             var rec = record.load({type: 'salesorder',id: org_so_internal, isDynamic : true});

             var numLines = rec.getLineCount({sublistId: 'item'});

             //rec.selectLine({ sublistId: 'item', line: 0 });
             var item_done = false;
             var counter = 0;

             while(item_done == false && counter < numLines)
             {   
                 var sublistItem= rec.getSublistValue({sublistId: 'item',fieldId: 'item',line: counter});

                 if (sublistItem == item_code)
                 {
                     item_done = true;
                     var Item_qty= rec.getSublistValue({sublistId: 'item',fieldId: 'quantity', line: counter});
                     var Item_rate= rec.getSublistValue({sublistId: 'item',fieldId: 'rate', line: counter});

                     if (Item_qty == 0)
                      {
                          response.write("*** There are some Issue for this Sales Order (error code 006)***");
                      }

                     else
                     {   Item_qty = Item_qty-1;
                         rec.selectLine({ sublistId: 'item', line: counter });
                         rec.setCurrentSublistValue({sublistId:  'item', fieldId:'quantity',value: Item_qty,});
                         rec.commitLine ({ sublistId: 'item', line: counter }); 
                        

                         rec.selectNewLine({ sublistId: 'item'});

                         rec.setCurrentSublistValue({
                             sublistId:  'item', 
                             fieldId:    'item',
                             value:      converse_item
                           });

                         rec.setCurrentSublistValue({
                             sublistId:  'item', 
                             fieldId:    'quantity',
                             value:      converse_qty
                           });

                         rec.setCurrentSublistValue({
                             sublistId:  'item', 
                             fieldId:    'amount',
                             value:      Item_rate
                           });
                         rec.commitLine ({ sublistId: 'item', line: counter }); 
                         rec.save(); 
                     }
                     
                 }
                 
                 counter = counter+1;
             }

             response.write(" Done! Thank you very much for your redemption!")


         }

     }

     }

     return {onRequest}

 });
