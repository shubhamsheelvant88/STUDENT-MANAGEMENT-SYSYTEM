const express = require("express")
const app = express()
const mysql = require("mysql2")
const cors = require("cors")
const path = require("path");
const methodOverride = require("method-override")
const engine = require("ejs-mate")
const session = require("express-session")
const flash = require("connect-flash")
app.use(cors());

app.use(express.static('public'));
app.use(express.urlencoded({ extended : true }));
app.use(methodOverride('_method'))
app.use(flash())
app.engine('ejs', engine)
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "/views"));


const sessionOptions = {
    secret : "mysupersecretcode",
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge  : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    }
}

app.use(session(sessionOptions))
app.use(flash())


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "sonu@123",
    database: "studentdb"
});

connection.connect((err) => {
    if (err) {
        console.log(err);
        return;
    }

    console.log("MySQL Connected");
});



app.get("/", (req, res) => {
    res.send("rout is working")
});

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// show all or search
app.get("/students", (req, res) => {
  let search = req.query.search;
  let q = search 
    ? "SELECT * FROM students WHERE name LIKE ?" // like matches the pattern in the name
    : "SELECT * FROM students"; // ternary opearator
  
  try {
    connection.query(q, search ? [`%${search}%`] : [], (err, result) => { // ternary operator
      if (err) {
        console.log(err);
        return res.send("Some error in DB");
      }
      res.render("showstudents.ejs", { students : result, search }); // in result we have that particular student what we have searched
    });
  } catch(err) {
    console.log(err);
    res.send("Some error in DB");
  }
});


app.get("/students/add", (req, res) => {
  res.render("addstudent.ejs")
});


app.get("/students/courses" , (req, res) => {
  res.render("courses.ejs");
});

app.get("/students/settings", (req, res) => {
  res.render("settings.ejs");
})

// get rout
app.get("/students/:id", (req, res) => {
    let id = req.params.id;

    let q = "SELECT * FROM students WHERE id = ?";

      try {
        connection.query(q, id, (err, result) => {
          if (err) {
            console.log(err);
            return res.send("Some error in DB");
          }
          if (!result[0]) {
            return res.send("Student not found");
          }
          res.render("show.ejs", { student: result[0] });
        });
      } catch(err) {
        console.log(err);
        res.send("Some error in DB");
      }
});

// create rout
app.post("/students", (req, res) => {
  let {id, name, email, semester, department, phone} = req.body;
  let q = `INSERT INTO students (id, name, email, semester, department, phone) VALUES (?, ?, ?, ?, ?, ?)`;

      try {
        connection.query(q, [id, name, email, semester, department, phone], (err, result) => {
          if (err) {
            console.log(err);
            return res.send("Some error in DB");
          }
          req.flash("success", "New Student Added!");
          res.redirect("/students");
        });
      } catch(err) {
        console.log(err);
        res.send("Some error in DB");
      }
});

// edit rout select that particular student
app.get("/students/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM students WHERE id = ? `
  try {
        connection.query(q, [id],  (err, result) => {
          if (err) {
            console.log(err);
            return res.send("Some error in DB");
          }
          if (!result[0]) {
            return res.send("Student not found");
          }
          res.render("edit.ejs", {student : result[0]})
        });
      } catch(err) {
        console.log(err);
        res.send("Some error in DB");
      }
});

// upadate 
app.patch("/students/:id/edit", (req, res) => {
  let { id } = req.params;
  let { name, email, semester, department, phone } = req.body;

  let q = "UPDATE students SET name=?, email=?, semester=?, department=?, phone=? WHERE id=?";

  try {
    connection.query(q, [name, email, semester, department, phone, id], (err, result) => {
      if (err) {
        console.log(err);
        return res.send("Some error in DB");
      }
      req.flash("success", "This Student Edited!");
      res.redirect("/students");
    });
  } catch(err) {
    console.log(err);
    res.send("Some error in DB");
  }
});


app.delete("/students/:id", (req, res) => {
  let { id } = req.params;

  let q = "DELETE FROM students WHERE id = ?";

  try {
    connection.query(q, [id], (err, result) => {
      if (err) {
        console.log(err);
        return res.send("Some error in DB");
      }
      req.flash("error", "This Student Deleted!");
      res.redirect("/students");
    });
  } catch(err) {
    console.log(err);
    res.send("Some error in DB");
  }
});

app.listen(8080, () => {
    console.log("app is listening your port");
});