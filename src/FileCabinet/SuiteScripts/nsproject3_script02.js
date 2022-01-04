/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
 define(['N/record', 'N/redirect', 'N/search'],
 /**
* @param{record} record
* @param{redirect} redirect
* @param{search} search
*/
 (record, redirect, search) => {
 
     /**
      * Defines the function definition that is executed before record is submitted.
      * @param {Object} scriptContext
      * @param {Record} scriptContext.newRecord - New record
      * @param {Record} scriptContext.oldRecord - Old record
      * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
      * @since 2015.2
      */
     const beforeSubmit = (scriptContext) => {

     }

     /**
      * Defines the function definition that is executed after record is submitted.
      * @param {Object} scriptContext
      * @param {Record} scriptContext.newRecord - New record
      * @param {Record} scriptContext.oldRecord - Old record
      * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
      * @since 2015.2
      */
     const afterSubmit = (scriptContext) => {

         var order = scriptContext.newRecord;

         var Generated_code_detail = "";
         var Gerenated_code_qty    = 0; 
         var Redeem_line_detail = "";
         var Redeem_line_qty = 0; 
         
         var internalID = order.getValue('id');
         var ItemsCount = order.getLineCount({ sublistId: 'item'});
         var error_note = 0;

         for (var i = 0; i < ItemsCount; i++) 
             
         { 
             
             var is_gift_Item = order.getSublistValue({sublistId: 'item',fieldId: 'custcol_p3_transaction_item_01',line: i});
             var is_generation = order.getSublistValue({sublistId: 'item',fieldId: 'custcol_p3_transaction_item_03',line: i});
             var item_id = order.getSublistValue({sublistId: 'item',fieldId: 'item',line: i});
             var item_qty = order.getSublistValue({sublistId: 'item',fieldId: 'quantity',line: i});
             
             log.debug(i + '-' + is_gift_Item + '-' +is_generation + '-' +item_id  + '-' +item_qty );

             if(is_gift_Item == true && is_generation == false)

             {   Redeem_line_qty = Redeem_line_qty + 1;
                 
                 var SetT = 'T';
                 if (Redeem_line_detail == "")
                     Redeem_line_detail = SetT;
                 else  
                     Redeem_line_detail = Redeem_line_detail + '-' + SetT ;
             
                 //-------------- Search out the available card --------------

                 var caseSearch = search.create({
                 type: 'customrecord_nsproject3_table1_gift_card',
                 title: 'Update the Card',
                 
                 filters: [
                      search.createFilter({
                      name:     'custrecord_p3_table1_so_number', 
                      operator:  search.Operator.ISEMPTY
                    }),

                 
                     search.createFilter({
                     name:     'custrecord_p3_table1_item', 
                     operator:  search.Operator.ANYOF,
                     values:    item_id
                   }),

                   search.createFilter({
                     name:     'custrecord_p3_table1_eligible', 
                     operator:  search.Operator.IS,
                     values:    'T'
                   }),
                 ],
                 
                 columns:[search.createColumn({name:'custrecord_p3_table1_item_name'})] 
                 });
                 var searchResults = caseSearch.run().getRange({ start: 0, end: 100});
 
                 if (searchResults.length > 0 )
                 {
                 //-------------Update the Gift Card Record ----------------------------

                 for (var j=0; j < item_qty; j++ )
                     { 
                     var rec1 = record.load({type: 'customrecord_nsproject3_table1_gift_card',
                                            id: searchResults[j].id , isDynamic : true});
                   
                     rec1.setValue({fieldId: 'custrecord_p3_table1_so', value: internalID});
                     
                     var callId = rec1.save();

                     log.debug('Code Record updated successfully', 'Id: ' + callId);

                     if (callId != 0)
                         { 
                             Generated_code_detail = callId + '-' + Generated_code_detail; 
                             Gerenated_code_qty  = Gerenated_code_qty + 1;
                         }
                     }
                 
                 } else { error_note = 1}
             } 
             else

                 { 
                 var SetT = 'F';
                 if (Redeem_line_detail == "")
                     Redeem_line_detail = SetT;
                 else  
                     Redeem_line_detail = Redeem_line_detail + '-' + SetT ;
                 }
         }
        
         log.debug(Redeem_line_detail );
         log.debug(Redeem_line_qty );
         log.debug(Gerenated_code_qty  );
         log.debug(Generated_code_detail );

     var note = 0 
     if (Gerenated_code_qty > 0)

         {   
            
             redirect.toSuitelet({
             scriptId : 'customscript_nsproject3_script03', 
             deploymentId: 'customdeploy_nsproject3_script03', 
             parameters :{
             
                             sales_order_id:                   internalID,
                             Generated_code_detail:            Generated_code_detail ,
                             Gerenated_code_qty:               Gerenated_code_qty,
                             Redeem_line_qty:                  Redeem_line_qty,
                             Redeem_line_detail:               Redeem_line_detail,
                             Total_line_qty:                   ItemsCount,
                             error_note:                       error_note 
                     }
             });

         }
     
     }

     return {afterSubmit}

 });
