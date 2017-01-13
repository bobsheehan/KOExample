

function InvoiceLoadVMClass() {

    InvoiceLoadVM = this;

    //-----------------------------
    // Observable properties
    //-----------------------------

    // General properties

    var From = new Date();
    var To = new Date();

    var date = new Date(), y = date.getFullYear(), m = date.getMonth();
    var firstDay = new Date(y, m-2, 1);
    var lastDay = new Date(y, m + 1, 0);

    //From.setDate(From.getDate()-30);
    //To.setDate(To.getDate() + 1);
    From = firstDay;
    To = lastDay;
    InvoiceLoadVM.FromDate = ko.observable(Common.Date.FormatMonthNonLocal(From));
    InvoiceLoadVM.ToDate = ko.observable(Common.Date.FormatMonthNonLocal(To));
    InvoiceLoadVM.FromDateInternal = ko.observable(Common.Date.FormatDateNonLocal(From));
    InvoiceLoadVM.ToDateInternal = ko.observable(Common.Date.FormatDateNonLocal(To));

 
    InvoiceLoadVM.invoiceLoadData = ko.observableArray();
    InvoiceLoadVM.invoiceLoadUniqueCoach = ko.observableArray();
    InvoiceLoadVM.NonBoundinvoiceLoadUniqueCoach = ko.observableArray();
   // InvoiceLoadVM.NonBoundinvoiceLoadAssignments = ko.observableArray();
    InvoiceLoadVM.NoLaginvoiceLoadAssignments = ko.observableArray();
    InvoiceLoadVM.NBNoLaginvoiceLoadAssignments = ko.observableArray();
    InvoiceLoadVM.invoiceListLogData = ko.observableArray();
    InvoiceLoadVM.reassignmentData = ko.observableArray();
    InvoiceLoadVM.grandTotal = ko.observable(0);

    InvoiceLoadVM.InvoiceDayDetail = ko.observableArray();
    InvoiceLoadVM.invoiceListSummaryData = ko.observableArray();
    InvoiceLoadVM.selectedStudentID = ko.observable();
    InvoiceLoadVM.allInvoicesSelected = ko.observable(false);
    
    //dialog box observables

    InvoiceLoadVM.instuctorPayID = ko.observable(0);
    InvoiceLoadVM.statusTo = ko.observable(0);
    InvoiceLoadVM.generalMessage = ko.observable('');
    
    // Filter arrays
    InvoiceLoadVM.SummarysortField = ko.observable("");
    InvoiceLoadVM.SummarysortAscending = ko.observable(false);

    
    InvoiceLoadVM.DynamicColumnCount = ko.observable(1);
    InvoiceLoadVM.DynamicColumns = ko.observableArray([]);
    
    
    InvoiceLoadVM.showTotalInformation = ko.observable(true);
    //dialog box observables
    InvoiceLoadVM.notes = ko.observable('');
    InvoiceLoadVM.instuctorPayID = ko.observable(0);
    InvoiceLoadVM.generalMessage = ko.observable('');
    
    //-----------------------------
    // Initialization
    //-----------------------------
    this.init = function (BaseURL, SecurityToken, IsAdmin, UserName, Institutions, ProgramTypes, CutOverDate) {

        InvoiceLoadVM.initBaseline(BaseURL, SecurityToken, UserName, IsAdmin);
        
        //build list of Institutions & Programs availible to this user
        InvoiceLoadVM.institutions(ko.utils.parseJson(Institutions));
        InvoiceLoadVM.programTypes(ko.utils.parseJson(ProgramTypes));
        InvoiceLoadVM.selectedInstructorID(CommonHelper.ParseQueryString('InstructorID'));
   
    }

    //-----------------------------
    // Observable Subscriptions
    //-----------------------------
   
    InvoiceLoadVM.DisplayMode.subscribe(function (newValue) {
        InvoiceLoadVM.StartNew();
       
       });

    InvoiceLoadVM.ShowDollars = function (newValue) {
        InvoiceLoadVM.DisplayMode('DAY');
        InvoiceLoadVM.StartNew();

    };
    InvoiceLoadVM.CutDate.subscribe(function (newValue) {
        if (newValue != InvoiceLoadVM.CutDateLast()) {
            InvoiceLoadVM.UpdateCutDate(newValue);
            //alert(InvoiceLoadVM.CutDateLast() + " to  " + newValue);
        }
    });

    InvoiceLoadVM.selectedProgramId.subscribe(function (newValue) {
        if (newValue > 0 || InvoiceLoadVM.selectedInstitution() > 0) {
            InvoiceLoadVM.showAll(0);
        } else {
            InvoiceLoadVM.showAll(1);
        };
    });

    InvoiceLoadVM.selectedInstitution.subscribe(function (newValue) {
        if (newValue > 0 || InvoiceLoadVM.selectedProgramId() > 0) {
            InvoiceLoadVM.showAll(0);
        } else {
            InvoiceLoadVM.showAll(1);
        }
    });
    
    //-----------------------------
    // Event handlers
    //-----------------------------

    InvoiceLoadVM.expand = function () {
        $('#tableleft').attr('width', 'auto');
        $('#tableleft').attr('white-space', 'nowrap');
       
    }
    InvoiceLoadVM.contract = function () {
        $('#tableleft').attr('width', '50%');
        $('#tableleft').attr('white-space', 'normal');
        $('#tableleft').attr('word-wrap','break-word');
        
    }

    InvoiceLoadVM.StartNew = function () {
        InvoiceLoadVM.invoiceLoadUniqueCoach([]);
        InvoiceLoadVM.NonBoundinvoiceLoadUniqueCoach([]);
        InvoiceLoadVM.NBNoLaginvoiceLoadAssignments([]);
        InvoiceLoadVM.NoLaginvoiceLoadAssignments([]);
        InvoiceLoadVM.page(1);          //Reset to first page on each filter
        InvoiceLoadVM.generalMessage('');
        InvoiceLoadVM.InvoiceDayDetail([]);
        InvoiceLoadVM.TotalItemSummaryCount(0);
        InvoiceLoadVM.showMessage(false);
    }

    
    InvoiceLoadVM.excelDownload = function () {
        InvoiceLoadVM.loadCoachLoad(1);
    }

    InvoiceLoadVM.sort = function (data, obj, event) {

        if (InvoiceLoadVM.sortField() == data) {
            InvoiceLoadVM.sortAscending(!InvoiceLoadVM.sortAscending());
        }
        InvoiceLoadVM.sortField(data);

        InvoiceLoadVM.DayDetail(InvoiceLoadVM.DetailInstructorID(), InvoiceLoadVM.DetailInstructor(), InvoiceLoadVM.DetailStipend(), InvoiceLoadVM.DetailBonus(), InvoiceLoadVM.DetailCoachCoverage(), InvoiceLoadVM.DetailMonth(), InvoiceLoadVM.DetailYear(), 0);
        // Add/Remove Sort Icon
        if (event) {
            var parent = $(event.target).parent();
            $(".Asc").remove(); $(".Desc").remove();
            if (InvoiceLoadVM.sortAscending())
                parent.append('<span class="Asc"></span>');
            else parent.append('<span class="Desc"></span>');
        }
    }

    
    InvoiceLoadVM.sortsummary = function (data, obj, event) {
     
        if (InvoiceLoadVM.SummarysortField() == data) {
            InvoiceLoadVM.SummarysortAscending(!InvoiceLoadVM.SummarysortAscending());
        }
        InvoiceLoadVM.SummarysortField(data);

        InvoiceLoadVM.filter();
        // Add/Remove Sort Icon
        if (event) {
            var parent = $(event.target).parent();
            $(".Asc").remove(); $(".Desc").remove();
            if (InvoiceLoadVM.SummarysortAscending())
                parent.append('<span class="Asc"></span>');
            else parent.append('<span class="Desc"></span>');
        }
    }




   
    //TODO It may make sense to move this into a common function
    InvoiceLoadVM.logOut = function () {
        StudentVMCommon.logOut(this);
    }
    //-----------------------------
    // Internal functions
    //-----------------------------


  
    InvoiceLoadVM.LoadCoachAssignmentsBuckets = function () {
        //assumes month and year rows have been populated
        //into InvoiceLoadVM.NoLaginvoiceLoadAssignments 
       
        var result = 0;
        InvoiceLoadVM.grandTotal(0);
        jQuery.each(InvoiceLoadVM.NBNoLaginvoiceLoadAssignments(), function (i, uniqueCoach) {
            var InstructorID = uniqueCoach.InstructorID();
            var InstructorName = uniqueCoach.InstructorName();
            var ReserverdCount = uniqueCoach.TotalReserved();
            var found = 0;
            jQuery.each(InvoiceLoadVM.DynamicColumns(), function (i, datebucket) {
                var month = datebucket.Month;
                var year = datebucket.Year;
                var found = 0;
                
              jQuery.each(InvoiceLoadVM.invoiceLoadData(), function (ii, rawcoachdata) {
                  if ((rawcoachdata.InstructorID == InstructorID) && (rawcoachdata.EnrollYear > 1970)){
                      var totalAssignment = 0;
                      var totalPay = 0;
                      var coachMonthTotal = rawcoachdata.TotalAssignments;
                      
                      if ((InvoiceLoadVM.DisplayMode() == "DOL") && (InstructorID > 0)) {
                          totalPay = rawcoachdata.TotalPay;
                          coachMonthTotal = totalPay;

                      }
                     
                      if ((rawcoachdata.EnrollMonth == month) && (rawcoachdata.EnrollYear == year)) {
                          totalAssignments = rawcoachdata.TotalAssignments;
                          var myMonths = {
                              'Month': rawcoachdata.EnrollMonth,
                              'Year': rawcoachdata.EnrollYear,
                              'Bonus': rawcoachdata.Bonus,
                              'CoachCoverage': rawcoachdata.CoachCoverage,
                              'TotalPay': totalPay,
                              'TotalAssignments': totalAssignments
                          }
                          uniqueCoach.MonthBuckets.push(myMonths);
                        
                          uniqueCoach.GrandTotal(uniqueCoach.GrandTotal() + coachMonthTotal);
                          found = 1
                        
                          if (InvoiceLoadVM.DisplayMode() === "NEW") {
                              InvoiceLoadVM.AddMonthTotals(rawcoachdata.EnrollMonth, rawcoachdata.EnrollYear, coachMonthTotal);
                              InvoiceLoadVM.grandTotal(InvoiceLoadVM.grandTotal() + coachMonthTotal);
                          }
                          else {
                              if (InstructorID > 0) { //don't total up non responders
                                  InvoiceLoadVM.AddMonthTotals(rawcoachdata.EnrollMonth, rawcoachdata.EnrollYear, coachMonthTotal);
                                  InvoiceLoadVM.grandTotal(InvoiceLoadVM.grandTotal() + coachMonthTotal);
                              }
                          }
                          
                          return 1; // found coach month & year. 
                      }

                       
                    } // raw loop
              }); // date loop
              if (found == 0) {

                  var myMonths = {
                      'Month': month,
                      'Year': year,
                      'Bonus': 0,
                      'CoachCoverage': 0,
                      'TotalPay':0,
                      'TotalAssignments': 0
                  }
                  uniqueCoach.MonthBuckets.push(myMonths);
                }

            });
            
        });
        return result;
    }

  
    InvoiceLoadVM.AddMonthTotals = function ( Month,Year,Total) {
        var result = 0;
        jQuery.each(InvoiceLoadVM.DynamicColumns(), function (i, dyMonth) {
            if ((dyMonth.Month==Month) && (dyMonth.Year==Year)) {
                
                dyMonth.GT(dyMonth.GT() + Total);
                return false;
                //Break out of jQuery.each
            }
        });
        return result;
    }

    InvoiceLoadVM.FindCoach = function (InstructorID) {
        var result = 0;
        jQuery.each(InvoiceLoadVM.NonBoundinvoiceLoadUniqueCoach(), function (i, coach) {
            if (coach.InstructorID == InstructorID) {
               // alert("found" + coach.InstructorName);
                result=1;
                return false;
                //Break out of jQuery.each
            }
        });
        return result;
    }



 
    InvoiceLoadVM.ExcelExport = function (JSONData, IncludedColumns, SheetName, FileName, TableTheme) {
        var workbook = ExcelBuilder.Builder.createWorkbook();
        var worksheet = workbook.createWorksheet({ name: SheetName });
        var stylesheet = workbook.getStyleSheet();
        var worksheetTable = new ExcelBuilder.Table();
        var originalData = Common.Export.ArrayFromJSON(JSONData, IncludedColumns, stylesheet);
        var currency = stylesheet.createFormat({
            format: '$#,##0.00_);($#,##0.00)'
        });
        if (originalData[originalData.length - 1][0]=== 'Non Responders' && InvoiceLoadVM.DisplayMode() !== 'NEW') {
            originalData.pop(); //Pop the non responders row
        }
        //set the table columns in the header
        var columnRow = [],
            summaryRow = [];
        for (var index in IncludedColumns) {
            if (index === 'Instructor') {
                columnRow.push({ name: IncludedColumns[index]['columnName'], totalsRowLabel: InvoiceLoadVM.DisplayMode() === 'DOL' ? 'Total Payment' : 'Grand Totals' });
                summaryRow.push(InvoiceLoadVM.DisplayMode() === 'DOL' ? 'Total Payment' : 'Grand Totals');
            } else {
                columnRow.push({ name: IncludedColumns[index]['columnName'], totalsRowFunction: 'sum' });
                if (InvoiceLoadVM.DisplayMode() === 'DOL') {
                    summaryRow.push({ value: "SUBTOTAL(109," + worksheetTable.name + "[" + IncludedColumns[index]['columnName'] + "])", metadata: { type: 'formula', style: currency.id }});
                } else {
                    summaryRow.push({ value: "SUBTOTAL(109," + worksheetTable.name + "[" + IncludedColumns[index]['columnName'] + "])", metadata: { type: 'formula'}});
                }
            }
        }
        //Before we set the sheet data we need to include the summary row
        originalData.push(summaryRow);
        worksheetTable.styleInfo.themeStyle = TableTheme;
        worksheetTable.setReferenceRange([1, 1], [originalData[0].length, originalData.length]);
        worksheetTable.totalsRowCount = 1;
        worksheetTable.setTableColumns(columnRow);
        worksheet.sheetView.showGridLines = false;
        worksheet.setData(originalData);
        workbook.addWorksheet(worksheet);
        worksheet.addTable(worksheetTable);
        workbook.addTable(worksheetTable);

        ExcelBuilder.Builder.createFile(workbook).then(function (originalData) {
            if ('download' in document.createElement('a')) {
                var link = document.createElement("a");
                //Create a blobURL instead of a dataURL since chrome restricts the dataURL to 2MB
                var blob = Common.Export.base64ToBlob(originalData, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                var blobUrl = URL.createObjectURL(blob);
                link.href = blobUrl;
                link.style = "visibility:hidden";
                link.download = FileName + '.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
    }

    InvoiceLoadVM.detailTotal = function (attribute) {
        var total = 0;
        for (var i = 0, len = InvoiceLoadVM.InvoiceDayDetail().length; i < len; i++) {
            total += InvoiceLoadVM.InvoiceDayDetail()[i][attribute];
        }
        return total;
    };

    InvoiceLoadVM.totalPayDetails = ko.computed(function () {
        return InvoiceLoadVM.detailTotal('TotalPay') + InvoiceLoadVM.DetailStipend() + parseFloat(InvoiceLoadVM.DetailBonus()) + parseFloat(InvoiceLoadVM.DetailCoachCoverage());
    });

 
    InvoiceLoadVM.exportSummary = function () {
        //Excel Export
        var IncludedColumns = {
            Instructor: { format: 'text', columnName: 'Instructor Name' }
        };
        if (InvoiceLoadVM.DisplayMode() === 'DOL') {
            IncludedColumns['Stipend'] = { format: 'currency', columnName: 'Stipend' };
        } else {
            IncludedColumns['TotalReserved'] = { format: 'text', columnName: 'Reserved' };
        }
        var ExcelJSONData = [];
        //Flatten the object 
        for (var i = 0, len = InvoiceLoadVM.NoLaginvoiceLoadAssignments().length; i < len; i++) {
            var InstructorObject = {
                'Instructor': InvoiceLoadVM.NoLaginvoiceLoadAssignments()[i].InstructorName()
            };
            if (InvoiceLoadVM.DisplayMode() === 'DOL') {
                InstructorObject['Stipend'] = InvoiceLoadVM.NoLaginvoiceLoadAssignments()[i].Stipend();
            } else {
                InstructorObject['TotalReserved'] = InvoiceLoadVM.NoLaginvoiceLoadAssignments()[i].TotalReserved();
            }
            //Loop through the Month Buckets
            for (var j = 0, bucketlen = InvoiceLoadVM.NoLaginvoiceLoadAssignments()[i].MonthBuckets().length; j < bucketlen; j++) {
                var bucketMonthObject = InvoiceLoadVM.NoLaginvoiceLoadAssignments()[i].MonthBuckets()[j];
                if (InvoiceLoadVM.DisplayMode() === 'DOL') {
                    //set the Instructor object
                    InstructorObject['Bonus' + bucketMonthObject.Month + bucketMonthObject.Year] = bucketMonthObject.Bonus;
                    InstructorObject['CoachCoverage' + bucketMonthObject.Month + bucketMonthObject.Year] = bucketMonthObject.CoachCoverage;
                    if (InvoiceLoadVM.selectedProgramId() > 0 || InvoiceLoadVM.selectedInstitution() > 0) {
                        InstructorObject['DailyRate' + bucketMonthObject.Month + bucketMonthObject.Year] = bucketMonthObject.TotalPay > 0 ? bucketMonthObject.TotalPay : 0;
                    } else {
                        InstructorObject['DailyRate' + bucketMonthObject.Month + bucketMonthObject.Year] = bucketMonthObject.TotalPay > 0 ? bucketMonthObject.TotalPay - (bucketMonthObject.CoachCoverage + bucketMonthObject.Bonus + InvoiceLoadVM.NoLaginvoiceLoadAssignments()[i].Stipend()) : 0;
                    }
                    InstructorObject['TotalPayment' + bucketMonthObject.Month + bucketMonthObject.Year] = bucketMonthObject.TotalPay;
                    //set the Included Columns and use the same key as Instructor object
                    IncludedColumns['Bonus' + bucketMonthObject.Month + bucketMonthObject.Year] = { format: 'currency', columnName: moment.months()[bucketMonthObject.Month - 1] + bucketMonthObject.Year + 'Bonus' };
                    IncludedColumns['CoachCoverage' + bucketMonthObject.Month + bucketMonthObject.Year] = { format: 'currency', columnName: moment.months()[bucketMonthObject.Month - 1] + bucketMonthObject.Year + 'Coverage' };
                    IncludedColumns['DailyRate' + bucketMonthObject.Month + bucketMonthObject.Year] = { format: 'currency', columnName: moment.months()[bucketMonthObject.Month - 1] + bucketMonthObject.Year + 'DailyRate' };
                    IncludedColumns['TotalPayment' + bucketMonthObject.Month + bucketMonthObject.Year] = { format: 'currency', columnName: moment.months()[bucketMonthObject.Month - 1] + bucketMonthObject.Year + 'TotalPayment' };
                } else {
                    InstructorObject['Assignment' + bucketMonthObject.Month + bucketMonthObject.Year] = bucketMonthObject.TotalAssignments;
                    //set the Included Columns and use the same key as Instructor object
                    IncludedColumns['Assignment' + bucketMonthObject.Month + bucketMonthObject.Year] = {
                        format: 'text', columnName: moment.months()[bucketMonthObject.Month - 1] + bucketMonthObject.Year
                    };
                }
            }
            if (InvoiceLoadVM.DisplayMode() !== 'DOL') {
                InstructorObject['GrandTotal'] = InvoiceLoadVM.NoLaginvoiceLoadAssignments()[i].GrandTotal();
                IncludedColumns['GrandTotal'] = { format: 'text', columnName: 'GrandTotal' };
            }
            ExcelJSONData.push(InstructorObject);
        }
        //Figure out the name of the file based on the filters selected
        var name = "";
        if (InvoiceLoadVM.selectedProgramId() > 0) {
            name = "by Program";
        }
        if (InvoiceLoadVM.selectedInstitution() > 0) {
            name = "by Institution";
        }
        if (InvoiceLoadVM.selectedInstitution() > 0 && InvoiceLoadVM.selectedProgramId() > 0) {
            name = "by Program and Institution";
        }

        if (InvoiceLoadVM.DisplayMode() === 'DOL') {
            InvoiceLoadVM.ExcelExport(ExcelJSONData, IncludedColumns, 'Invoice Summary', 'Invoice Summary ' + name, 'TableStyleMedium14');
        } else if (InvoiceLoadVM.DisplayMode() === 'NEW') {
            InvoiceLoadVM.ExcelExport(ExcelJSONData, IncludedColumns, 'Assignments Summary', 'Assignments Summary ' + name, 'TableStyleMedium14');
        } else {
            InvoiceLoadVM.ExcelExport(ExcelJSONData, IncludedColumns, 'Days Summary', 'Days Summary ' + name, 'TableStyleMedium14');
        }
    }

    InvoiceLoadVM.loadCoachLoad = function (excelFormat) {
        if (excelFormat) {
            InvoiceLoadVM.exportSummary();
        } else {
            InvoiceLoadVM.StartNew();
            $('#LoadingDisplay').dialog('open');
            var URL = InvoiceLoadVM.baseURL + "Services/Invoice/CoachLoad"
            
            $.ajax({
                type: 'POST',
                url: URL,
                dataType: 'json',
                data: {
                    InstructorID: InvoiceLoadVM.selectedInstructorID(),
                    InstitutionID: InvoiceLoadVM.selectedInstitution(),
                    ProgramID: InvoiceLoadVM.selectedProgramId(),
                    FromDate: InvoiceLoadVM.FromDate(),
                    ToDate: InvoiceLoadVM.ToDate(),
                    SortField: InvoiceLoadVM.SummarysortField(),
                    SortAscending: InvoiceLoadVM.SummarysortAscending(),
                    SecurityToken: InvoiceLoadVM.securityToken
                },
                success: function (data) {

                    if (data.Payload.length < 1) {
                        InvoiceLoadVM.generalMessage("No Data Found");

                    }
                    InvoiceLoadVM.TotalItemSummaryCount(data.Payload.length);
                    if (!excelFormat) {
                        InvoiceLoadVM.invoiceLoadData(data.Payload);
                    }
                   
                    // build a list of unique instructor names
                    for (var i = 0; i < data.Payload.length; i++) {
                        if (!excelFormat) {
                            data.Payload[i].IsChecked = ko.observable(false)

                        };
                        
                        //LB: build a unique list of coaches
                        if (!InvoiceLoadVM.FindCoach(data.Payload[i].InstructorID)) {
                            var finalData = {
                                InstructorID: ko.observable(data.Payload[i].InstructorID),
                                InstructorName: ko.observable(data.Payload[i].InstructorName),
                                TotalReserved: ko.observable(data.Payload[i].TotalReserved),
                                GrandTotal: ko.observable(0),
                                MonthBuckets: ko.observableArray(),
                                Stipend: ko.observable(data.Payload[i].Stipend),
                                Comments: ko.observable(data.Payload[i].Comments)
                            }

                            InvoiceLoadVM.NBNoLaginvoiceLoadAssignments.push(finalData);
                            InvoiceLoadVM.NonBoundinvoiceLoadUniqueCoach.push(data.Payload[i]);
                        }

                    }

                    // build dynamic column array
                    var From = new Date(InvoiceLoadVM.FromDate());
                    var To = new Date(InvoiceLoadVM.ToDate());
                    var FromInternal = new Date(InvoiceLoadVM.FromDateInternal());
                    var ToInternal = new Date(InvoiceLoadVM.ToDateInternal());

                    InvoiceLoadVM.DynamicColumnCount(ToInternal.getMonth() - FromInternal.getMonth() + (12 * (ToInternal.getFullYear() - FromInternal.getFullYear())) + 1);
                    InvoiceLoadVM.DynamicColumns([]);
                    var startMonth = FromInternal.getMonth();
                    var startYear = FromInternal.getFullYear();
                    for (var i = 0; i < InvoiceLoadVM.DynamicColumnCount() ; i++) {
                        InvoiceLoadVM.DynamicColumns.push({ 'Month': startMonth + 1, "Year": startYear, "GT": ko.observable(0) });
                        startMonth++;
                        //account for year cross over
                        if (startMonth > 11) {
                            startMonth = 0;
                            startYear++;
                        }
                    }

                    InvoiceLoadVM.invoiceLoadUniqueCoach(InvoiceLoadVM.NonBoundinvoiceLoadUniqueCoach());
                    InvoiceLoadVM.LoadCoachAssignmentsBuckets();
                    InvoiceLoadVM.NoLaginvoiceLoadAssignments(InvoiceLoadVM.NBNoLaginvoiceLoadAssignments());
                },
                statusCode: {
                    401: function (data) {
                        Common.ServiceAuthUnauthorized.RefreshLogin(data);
                    }
                },
                error: function (data) {
                    Common.ServiceAuth.HandleRedirectError(InvoiceLoadVM.baseURL, InvoiceLoadVM.userName(), 'InvoiceLoadVM.js/loadInvoiceSummarylData', data);
                    // Common.UI.Toast(Common.Constants.Messages.ErrorOccurred + '  (' + data.error().statusText + ')');
                },
                complete: function (data) {
                    $('#LoadingDisplay').dialog('close');
                }
            });
        }
    }

    InvoiceLoadVM.addComments = function (InstructorID, InstructorName, Comments) {
        InvoiceLoadVM.commentInstructorID(InstructorID);
        InvoiceLoadVM.selectedInstructorName(InstructorName);
        InvoiceLoadVM.selectedInstructorComments(Comments);
        $("#CommentPopup").dialog("open");
    };

    InvoiceLoadVM.saveComments = function () {
        $.ajax({
            type: 'POST',
            url: InvoiceLoadVM.baseURL + "Services/User/SetUserInstuctorRates",
            dataType: 'json',
            data: {
                SecurityToken: InvoiceLoadVM.securityToken,
                UserId: InvoiceLoadVM.commentInstructorID(),
                Comments: InvoiceLoadVM.selectedInstructorComments()
            },
            success: function (data) {
                Common.UI.Toast("Comment added successfully. Note that you need to fetch data (again)  for the added comments");
            },
            statusCode: {
                401: function (data) {
                    Common.ServiceAuthUnauthorized.RefreshLogin(data);
                }
            },
            error: function (data) {
                Common.UI.Toast("There was an error modifying Comments. Please refresh the page and try again.");
                Common.ServiceAuth.HandleRedirectError(InvoiceLoadVM.baseURL, InvoiceLoadVM.userName(), 'InvoiceLoadVM.js/loadInvoiceSummarylData', data);
            },
            complete: function (data) {
                $("#CommentPopup").dialog("close");
            }
        });
    };

    InvoiceLoadVM.closeCommnentPopup = function () {
        $('#CommentPopup').dialog('close');
    };
 
    InvoiceLoadVM.LegendPop = function () {
        $('#LegendPopup').dialog('open');
    };

     
}

$(document).ready(function () {

    //Apply jQueryUI methods
    
   // $("#PageSize").chosen({ width: "70px", "disable_search": true })
    $(".chosenSelect").chosen({ placeholder_text_single: "All", allow_single_deselect: true });

    $("#jMenu").jMenu();
    $("button").button();
   
    $("#CommentPopup").dialog({
        modal: true,
        autoOpen: false,
        height: 'auto',
        minHeight: 120,
        width: 400,
        position: ['middle', 50],
        show: { effect: "fade", duration: 400 },
        hide: { effect: "fade", duration: 400 },
        open: function (event, ui) {
            $("#CommentPopup").dialog({ title: 'Add/Edit comment for ' + InvoiceLoadVM.selectedInstructorName() });
        }
    });



    $("#PayPopup").dialog({
        modal: true,
        autoOpen: false,
        height: 'auto',
        minHeight: 120,
        width: 400,
        position: ['middle', 50],
        show: { effect: "fade", duration: 400 },
        hide: { effect: "fade", duration: 400 },
    });

    $("#ManualConfirm").dialog({
        modal: true,
        autoOpen: false,
        height: "auto",
        width: "auto",
        show: { effect: "fade", duration: 400 },
        hide: { effect: "fade", duration: 400 },
        buttons: {
            Ok: function () {
                $(this).dialog("close");
                InvoiceLoadVM.ManualConfirmOKClick();
            },
            Cancel: function () {
                Common.UI.Toast("Action Canceled");
                $(this).dialog("close");
            }
        }
    });

    $("#LegendPopup").dialog({
        modal: true,
        autoOpen: false,
        height: "auto",
        minHeight: 120,
        width: 250,
        show: { effect: "fade", duration: 400 },
        hide: { effect: "fade", duration: 400 },
        buttons: {
            Ok: function () {
                $(this).dialog("close");
            }
        }
    });

    $("#LogDetails").dialog({
        modal: true,
        autoOpen: false,
        height: "auto",
        width: "auto",
        show: { effect: "fade", duration: 400 },
        hide: { effect: "fade", duration: 400 },
        buttons: {
            Ok: function () {
                $(this).dialog("close");
            }
        }
    });

    $("#ReassignmentDetails").dialog({
        modal: true,
        autoOpen: false,
        height: "auto",
        width: "auto",
        show: { effect: "fade", duration: 400 },
        hide: { effect: "fade", duration: 400 },
        buttons: {
            Ok: function () {
                $(this).dialog("close");
            }
        }
    });

    $(function () {
   
        $("#CutDate").datepicker({
        });
        /*to do - figure out how to bind this generically: can't figure out the dependacy change timing on jquery and knockout*/
        $('#Fromdatepicker').datepicker({
            dateFormat: 'MM yy',
            showButtonPanel: true,
            changeMonth: true,
            changeYear: true,
           
           
            onClose: function (dateText, inst) {
                var newdate = Common.Date.FormatMonthNonLocal(new Date(inst.selectedYear, inst.selectedMonth, 1));
         
            //    $(this).datepicker('setDate', newdate);
                InvoiceLoadVM.FromDate(newdate);
                InvoiceLoadVM.FromDateInternal(Common.Date.FormatDateNonLocal(new Date(inst.selectedYear, inst.selectedMonth, 1)));

            }
        });
        $('#Todatepicker').datepicker({
            dateFormat: 'MM yy',
            showButtonPanel: true,
            changeMonth: true,
            changeYear: true,
            onClose: function (dateText, inst) {
                var newdate = Common.Date.FormatMonthNonLocal(new Date(inst.selectedYear, inst.selectedMonth, 2));
              //  $(this).datepicker('setDate', newdate);
                InvoiceLoadVM.ToDate(newdate);
                InvoiceLoadVM.ToDateInternal(Common.Date.FormatDateNonLocal(new Date(inst.selectedYear, inst.selectedMonth, 2)));
            }
        });


    });
    
   
});

$(function () {
    CommonHelper.setupMultiDropDown("#multiaction");
});
    

InvoiceLoadVMClass.prototype = new VATIModelSuperClass()
ko.applyBindings(new InvoiceLoadVMClass());
