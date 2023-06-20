import j from 'jscodeshift'
import { transformAppFile } from "./addDatePicker";
import { toString } from "./utils";

//
// The transformation
//

const transformation = transformAppFile;
const transformationName = "Add Date picker";

//
// The input of the transformation
//

const root = j(`\
export default function App() {
  return (<div><h1>Hello world</h1></div>)
}\
`);

//
// The expected output of the transformation
//

const expected = j(`\
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function App() {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div>
      <h1>Hello world</h1>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="dd/MM/yyyy"
      />
    </div>
  );
}\
`)

//
// Check that the transformation works as expected
//
describe(transformationName, () => {
  test("Check AST transformation", () => {
    expect(
      toString(transformation(root))
    ).toEqual(
      toString(expected)
    )
  });
});