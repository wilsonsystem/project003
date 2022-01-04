/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
 define(['N/record', 'N/redirect', 'N/ui/serverWidget','N/search','N/format','N/runtime','N/https','N/url','./nsproject3_custom01.js'],
 /**
* @param{record} record
* @param{redirect} redirect
* @param{search} search
* @param{runtime} runtime
* @param{format} format
* @param{serverWidget} serverWidget
*/

// Line 246 - 247 Ensure the deploy id is correct 

 (record, redirect, serverWidget,search,format,runtime,https,url,nsproject3_custom01) => {
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

         if (request.method == 'GET'){

             var form = serverWidget.createForm({
                 title: 'Generation Gift Card with QR Code For Redemption',
                 hideNavBar: false
             });

             var fieldgroup1 = form.addFieldGroup({id : 'basicgroup',label : 'Basic Information'});
             var fieldgroup2 = form.addFieldGroup({id : 'codegroup',label : 'About the Code'});

             fieldgroup1.isSingleColumn = true;
             fieldgroup2.isSingleColumn = true;

             var amountFld = form.addField({
                 id: 'custpage_p3_num_of_code', 
                 type: serverWidget.FieldType.SELECT, 
                 label: 'Number of Code Set generated',
                 container : 'codegroup'
             });

             amountFld.addSelectOption({ value: '1', text: '1 Set'});
             amountFld.addSelectOption({ value: '5', text: '5 Set'});
             amountFld.addSelectOption({ value: '10', text: '10 Set'});
             amountFld.addSelectOption({ value: '15', text: '15 Set'});
             amountFld.addSelectOption({ value: '20', text: '20 Set'});
             amountFld.addSelectOption({ value: '25', text: '25 Set'});

         //-------------------------------------------------------------------
             
             var couponItemFld = form.addField({
                 id: 'custpage_p3_item', 
                 type: serverWidget.FieldType.SELECT, 
                 label: 'Target Items for Redemption',
                 container : 'basicgroup'

                 });

             var expDateFld = form.addField({
                id: 'custpage_p3_exp_date', 
                type: serverWidget.FieldType.DATE, 
                label: 'Expired Date',
                container : 'basicgroup'
                });

                expDateFld.isMandatory = true;

         //--------Item For Redeem---------------------------------------------------- 

             var caseSearch = search.create({
                 type: search.Type.ITEM, 
                 title: 'Available Items',
                 
                 filters: [                  
                    search.createFilter({
                      name:     'custitem_p3_item_01', 
                      operator:  search.Operator.IS,
                      values:    true
                    })
                    ],
                 
                 columns:[search.createColumn({name:'displayname'})] 
             });
                 
             var searchResults = caseSearch.run().getRange({ start: 0, end: 100});
             
             for (let i=0; i<searchResults.length; i++)

                 {
                     var itemID =   searchResults[i].id;
                     var display =  searchResults[i].getValue({name:'displayname'});  /** */
                     
                     couponItemFld.addSelectOption({ value: itemID, text: display });
               
                 }
                 
             //-----------------------------------------------------------------

             var lenghtFld  = form.addField({
                 id: 'custpage_p3_amount_number',
                 type: serverWidget.FieldType.SELECT,
                 label: 'Lenght of the Coupon Code: ',
                 container : 'codegroup'
             });

                 lenghtFld.addSelectOption({ value: '10', text: '10 dights'});
                 lenghtFld.addSelectOption({ value: '15', text: '15 dights'});
                 lenghtFld.addSelectOption({ value: '20', text: '20 dights'});
                 lenghtFld.addSelectOption({ value: '25', text: '25 dights'});

             var upperFld = form.addField({
                 id: 'custpage_p3_if_upper', 
                 type: serverWidget.FieldType.CHECKBOX, 
                 label: 'Including Upper Case ?',
                 container : 'codegroup'
             });
             

             var numberFld = form.addField({
                 id: 'custpage_p3_if_number', 
                 type: serverWidget.FieldType.CHECKBOX, 
                 label: 'Including Number ?',
                 container : 'codegroup'
             });


             var symbolFld = form.addField({
                 id: 'custpage_p3_if_symbol', 
                 type: serverWidget.FieldType.CHECKBOX, 
                 label: 'Including Symbol ?',
                 container : 'codegroup'
             });

                upperFld.defaultValue = 'T';
                numberFld.defaultValue = 'T';
                symbolFld.defaultValue = 'T';
                expDateFld.defaultValue = '01/01/2022';


            //-----------Get Current Users Info -------------------------------------------------

             var current_user_id = runtime.getCurrentUser().id;
             var current_user_name = runtime.getCurrentUser().name;

             var creatorNameFld = form.addField({
                id: 'custpage_p3_creator', 
                type: serverWidget.FieldType.TEXT, 
                label: 'Created By Employee',
                container : 'basicgroup'
            });
            creatorNameFld.defaultValue = current_user_name;

            creatorNameFld.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.INLINE
            });

            var creatorIdFld = form.addField({
                id: 'custpage_p3_creator_id', 
                type: serverWidget.FieldType.TEXT, 
                label: 'Employee ID'
            });
            
                creatorIdFld.defaultValue = current_user_id;
                creatorIdFld.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });

            //---------------------------------------------------------------------


             form.addSubmitButton('Gerenate Code'); 
             response.writePage(form);           
         }
         else // POST 
         { 
              
            set_of_code =               request.parameters.custpage_p3_num_of_code;
            characterAmountNumber   =   request.parameters.custpage_p3_amount_number;
            includeUppercase =          request.parameters.custpage_p3_if_upper;
            includeNumbers   =          request.parameters.custpage_p3_if_number;
            includeSymbols   =          request.parameters.custpage_p3_if_symbol;
                 
            request_item     =          request.parameters.custpage_p3_item;
            request_exp_date =          request.parameters.custpage_p3_exp_date;
            request_creator  =          request.parameters.custpage_p3_creator_id;
                 
                 
//----------------------------------------------------------------------------------------

            if (!request_exp_date)
                {
                    response.write("Warming! Please enter the expiry date of Gift Cards! ");
                }
            
            else
            {
            
//------------------------------------------------------------------------------------------

            var redeem_url = url.resolveScript({
                    scriptId: 'customscript_nsproject3_script04',
                    deploymentId: 'customdeploy_nsproject3_script04'
                });
    
            temp_url = redeem_url.split('compid');
    
            redeem_url = 'https://'+runtime.accountId+'.app.netsuite.com'+ temp_url[0] + '&code='

// -------------------------Create the Gift Card Record --------------------------------------

                     function Create_Coupon_Table(Fitem,Fexpire_date,Fcode,creator)
                     {
                        var rec = record.create({type: 'customrecord_nsproject3_table1_gift_card',
                                                 isDynamic : true});
                     
                        rec.setValue({fieldId: 'custrecord_p3_table1_item', value: Fitem});

                        input_date = format.parse({value: Fexpire_date, type:format.Type.DATE});

                        rec.setValue({fieldId: 'custrecord_p3_table1_expire_date', value: input_date});
                        rec.setValue({fieldId: 'custrecord_p3_table1_code', value: Fcode});

                        rec.setValue({fieldId: 'custrecord_p3_table1_redeem_link', value:  redeem_url+Fcode});

                        rec.setValue({fieldId: 'custrecord_p3_table1_eligible', value: true});
                        rec.setValue({fieldId: 'custrecord_p3_table1_generated', value: creator});

                        
                        //log.debug({title: 'QR code', details: nsproject3_custom01.get_qr_code(Fcode)});

                        qrcode1 = '<br></br><img alt="Scan me!" src="' + nsproject3_custom01.get_qr_code(Fcode,redeem_url) + '" style="display: block;"></img>';

                        rec.setValue({fieldId: 'custrecord_p3_table1_code_source1', value: qrcode1});

                        try 
                        { var callId = rec.save();
                          log.debug('Code Record created successfully', 'Id: ' + callId);
                        } catch (e) {
                            log.debug('Fail');
                            log.error(e.name);
                        }
                     }     
                    
                     for (let i = 0; i < set_of_code; i++) 
                     {
                        var code = nsproject3_custom01.generatePassword(characterAmountNumber,includeUppercase,includeNumbers,includeSymbols);
                        
                        Create_Coupon_Table(request_item, request_exp_date, code,request_creator);
                     }
                    
                     //--------------find the internal id of search and redirect------------------


                    var caseSearch2 = search.create({
                            type: search.Type.SAVED_SEARCH, 
                            title: 'Find the internal id',
                            filters: [search.createFilter({name: 'ID', operator:  search.Operator.IS, values: 'customsearch13'}) ],
                            columns: [search.createColumn({name:'ID'}),] 
                        });

                    var searchResults = caseSearch2.run().getRange({start:  0, end:  1});

                    var internal_Idd =  searchResults[0].id;
                    
                    redirect.toSavedSearchResult({
                        id: internal_Idd
                    });
            }
         }
     }

     return {onRequest}

 });


