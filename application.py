from distutils.log import error
import os
import requests
import jwt
from flask import Flask, abort, request_started, session, render_template, session, request, redirect, flash, url_for, jsonify
from flask_session import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from flask_restful import Resource, Api
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Set up database
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if not username:
            flash("Error: Please enter a username", 'warning')
            return render_template("login.html")
        elif not password:
            flash("Error: Please enter a password", 'warning')
            return render_template("login.html")

        result = db.execute("SELECT password FROM user_info WHERE username = :username",
                            {"username": username}).fetchone()[0]

        if result == None or not check_password_hash(result, password):
            flash("invalid username and/or password", 'warning')
            return render_template("login.html")

        session["username"] = username

        return redirect(url_for("map"))

    else:
        return render_template("login.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        fname = request.form.get('fname')
        lname = request.form.get('lname')
        password = request.form.get('password')
        verify = request.form.get('repass')

        if not username:
            flash("Error: Please enter a username", 'warning')
            return redirect(url_for('register'))

        Verify = db.execute(
            "SELECT * FROM user_info WHERE username = :username", {"username": username}).fetchall()

        if Verify:
            flash("Username already exists", 'warning')
            return render_template("register.html")

        elif not password:
            flash("Error: Missing password", 'warning')
            return render_template("register.html")
        elif not verify:
            flash("Error: Verify password is missing", 'warning')
            return render_template("register.html")
        elif password != verify:
            flash("Error: Password don't match", 'warning')
            return render_template("register.html")
        else:

            password_hash = generate_password_hash(password)

            db.execute(
                f"INSERT INTO user_info (fname, lname, username, password) VALUES ('{fname}','{lname}','{username}','{password_hash}')")
            db.commit()

            flash("Congrats your account was created", 'success')

            return redirect(url_for('login'))
    else:
        return render_template('register.html')


@app.route("/map", methods=["GET", "POST"])
def map():

    return render_template('map.html')


@app.route("/profile", methods=["GET", "POST"])
def profile():
    now = datetime.now()
    username = session["username"]
    if 'username' not in session:

        flash("No username found in session", 'error')
        return redirect(url_for("index"))

    if request.method == "POST":
        
        dt = now.strftime("%d/%m/%Y %H:%M:%S")
        rating = int(request.form.get("rating"))
        comment = request.form.get("comment")
        
        db.execute("INSERT INTO comments (username, rating, comment, dt) VALUES\
            (:username, :rating, :comment, :dt)",
                   {"username": username, "rating": rating, "comment": comment, "dt":dt })

        db.commit()

        flash('Review submitted', 'success')

        return redirect("/profile")

    else:
        username = db.execute(
            "SELECT username FROM user_info WHERE username = :username", {"username": username}).fetchone()[0]
        comments = db.execute("SELECT username, comment, rating, dt \
                            FROM comments \
                            WHERE username = :username",
                             {"username": username}).fetchall()
        verify = db.execute("SELECT * FROM comments WHERE username = :username",
                            {"username": username})

        if verify.rowcount == 1:
            dt = db.execute("SELECT dt FROM comments WHERE username = :username", {"username": username}).fetchall()[0][0]
        else:
            dt = "MON-DD-YYYY"

        fname = db.execute("SELECT fname FROM user_info WHERE username = :username", {
                           "username": username}).fetchall()[0][0]
        lname = db.execute("SELECT lname FROM user_info WHERE username = :username", {
                           "username": username}).fetchall()[0][0]
        return render_template("profile.html",
            dt=dt,
            comments=comments,
            username=username,
            fname=fname,
            lname=lname)

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")
