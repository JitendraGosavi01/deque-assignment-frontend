import "./App.css";
import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { red } from "@mui/material/colors";

/**
 * It takes a string, splits it into an array of words, and returns the first letter of the first word
 * and the last letter of the last word
 * @param title - The title of the movie
 * @returns The first letter of the first word and the first letter of the last word.
 */
const convertTitleToInitial = (title) => {
  let splitted = title.split(" ");
  return splitted[0][0] + splitted[splitted.length - 1][0];
};
/**
 * It takes in a row of data and returns a table row with an expandable row
 * @param props - This is the props object that is passed to the component.
 * @returns a React Fragment.
 */
function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow
        sx={{ "& > *": { borderBottom: "unset" } }}
        aria-label="expand row"
        size="small"
        onClick={() => setOpen(!open)}
      >
        <TableCell align="left">
          <IconButton>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        <TableCell align="left">
          {row.volumeInfo?.authors || "No authors available!"}
        </TableCell>
        <TableCell align="left">
          {row.volumeInfo?.title || "No title available!"}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            {/* <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Description
              </Typography>
              <div style={{ width: "100%" }}>
                <Box
                  sx={{
                    display: "block",
                    displayPrint: "none",
                    m: 1,
                    fontSize: "0.875rem",
                    fontWeight: "700",
                  }}
                >
                  {row?.volumeInfo?.description
                    ? row?.volumeInfo?.description
                    : "No description available!"}
                </Box>
              </div>
            </Box> */}
            <Card sx={{ maxWidth: 500 }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                    {convertTitleToInitial(row.volumeInfo.title)}
                  </Avatar>
                }
                title={row.volumeInfo.title}
                subheader={new Date(
                  row.volumeInfo.publishedDate
                ).toLocaleDateString("en", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
              <CardMedia
                component="img"
                height="194"
                image={row?.volumeInfo?.imageLinks?.thumbnail}
                alt={row.volumeInfo.title}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {row.volumeInfo.description}
                </Typography>
              </CardContent>
            </Card>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}
Row.propTypes = {
  row: PropTypes.shape({
    author: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};
function App() {
  const [search, setSearch] = useState("");
  const searchBoxRef = useRef();
  const [result, setResult] = useState([]);
  const [library, setLibrary] = useState([]);

  const [startIndex, setStartIndex] = useState(5);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [resultLength, setResultLength] = useState(0);
  /**
   * It takes the value of the search box, sets the search state to that value, and then fetches the
   * data from the backend
   */
  const getSearchedText = async () => {
    console.log(searchBoxRef.current.value);
    setSearch(searchBoxRef.current.value);
    await fetch(
      `http://localhost:3001/api/v1/search?text=${searchBoxRef.current.value}&startIndex=${startIndex}&maxResults=40`
    )
      .then((res) => res.json())
      .then((res) => {
        setLibrary(res.data);
      })
      .catch((err) => console.log(err));
  };

  /* A react hook that is called when the library state changes. It takes the first 5 items from the
  library and sets it to the result state. */
  useEffect(() => {
    const extracted = [];
    if (library.length > 0) {
      for (let index = 1; index <= 5; index++) {
        extracted.push(library[index]);
      }
      setResult(extracted);
    }
  }, [library]);

  /**
   * It returns a table container component with a table component inside it. The table component has a
   * table head component with a table row component inside it. The table row component has two table
   * cell components inside it. The table body component has a row component inside it. The row
   * component has a table row component inside it. The table row component has three table cell
   * components inside it
   * @returns A table with the results of the search.
   */
  const renderTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell width="5%">#</TableCell>
              <TableCell align="left">Author</TableCell>
              <TableCell align="left">Title</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result.map((row) => (
              <Row key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  /**
   * When the user clicks on the next or previous page button, the page number is updated and the
   * resultLength is updated to reflect the new page number
   * @param event - The event that triggered the change.
   * @param newPage - The page number that the user clicked on.
   */
  const handleChangePage = (event, newPage) => {
    setPage(newPage);

    if (event.currentTarget.ariaLabel === "Go to previous page") {
      setResultLength(resultLength + rowsPerPage);
      setResult([...library].splice(resultLength, rowsPerPage));
    }
    if (event.currentTarget.ariaLabel === "Go to next page") {
      setResultLength(resultLength - rowsPerPage);
      setResult([...library].splice(resultLength, rowsPerPage));
    }
  };

  /**
   * It takes the value of the rows per page and sets the state of the rows per page to that value
   * @param event - The event that triggered the function.
   */
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    const extracted = [];
    for (let index = 1; index <= event.target.value; index++) {
      extracted.push(library[index]);
    }
    setResult(extracted);
    setPage(0);
  };

  return (
    <div className="App">
      <header className="App-header">
        <Typography variant="h3" component="h2">
          Your own library
        </Typography>
        <div id="searchField">
          <TextField
            type="text"
            name="search"
            defaultValue={search}
            placeholder="search book here..."
            inputRef={searchBoxRef}
            id="outlined-basic"
            label="Search Book"
            variant="outlined"
          />
          <Button onClick={() => getSearchedText()} variant="outlined">
            Search
          </Button>
        </div>
        <Typography variant="h5" component="h2">
          Book's
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Result count: {library.length}
        </Typography>
        {library.length > 0 && renderTable()}
        {library.length > 0 && (
          <TablePagination
            component="div"
            count={40}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 30]}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </header>
    </div>
  );
}

export default App;
