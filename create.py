import os


import psycopg2 as pc2

DATABASE_URL = os.environ['DATABASE_URL']

conn = pc2.connect(DATABASE_URL, sslmode='require')
curr = conn.cursor()
'''
# Created user table
curr.execute("DROP TABLE user_info;")
curr.execute("CREATE TABLE user_info (id SERIAL PRIMARY KEY, \
                                      fname VARCHAR NOT NULL, \
                                      lname VARCHAR NOT NULL, \
                                      username VARCHAR NOT NULL, \
                                      password VARCHAR NOT NULL);")
conn.commit()
#print("Created user table!")
'''
# Create comment table
curr.execute("DROP TABLE comments;")
curr.execute("CREATE TABLE comments (id SERIAL PRIMARY KEY, \
                                     username VARCHAR NOT NULL, \
                                     rating INT NOT NULL, \
                                     comment VARCHAR NOT NULL, \
                                     dt VARCHAR NOT NUll);")
conn.commit()

print("Comment table created!!")
'''
#curr.execute("DROP TABLE oauth_user;")
curr.execute("CREATE TABLE oauth_user (id SERIAL PRIMARY KEY, \
                                      user_id INTEGER NOT NULL);")
conn.commit()
print("oauth_user table created!")

#curr.execute("DROP TABLE oauth_code;")
curr.execute("CREATE TABLE oauth_code (id SERIAL PRIMARY KEY, \
                                        user_id INTEGER NOT NULL);")
conn.commit()
print("oauth_code table created!")

#curr.execute("DROP TABLE oauth_token;")
curr.execute("CREATE TABLE oauth_token (id SERIAL PRIMARY KEY, \
                                        user_id INTEGER NOT NULL);")
conn.commit()
print("oauth_token table created")'''