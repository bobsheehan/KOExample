# Knockout example - dynamic row/column table
The dynamic (columns & row)  table has the following requirement. For each unique coach in the JSON, 

 1) total up the number of reserved students
 2) show the total number of students for each month of the selected date range. If zero then show zero (not blank or empty)
 3) total up just  #2
 4) total the columns for #2 only
 

My original approach was to build an observable array of dates (so for example, if your date range was Jan through March then that array would have 3 nodes (Jan/Feb/March). Then I would iterate each row in the JSON

However, that approach quickly became non performant with any dataset > 500 rows. So instead I denormalized/optimized 2 new observable arrays and used css to mimic table cells

 The code sample notes are :
 ### js file ( subset of non linted/minified - lots of code removed also that was not relivent to this task) 
- Build an observable array of unique coaches from the raw json data that will be used to hold items #1 & #3 above as well as hold an observable array for item #2 above; (see ~line 494 )
- Build a ‘Master’ dynamic column for months. This holds each unique month between the selected to & from dates. (~line 525)
- Loop through each coach in item #1 above, and loop through #2 and build a dense array of assignments for each month from the raw data (see function LoadCoachAssignmentsBuckets ~ line 201)

### cshtml
- Shows the table binding only.