import os
from flask_frozen import Freezer
from app import app  # Import your Flask app

# Initialize Freezer
freezer = Freezer(app)

if __name__ == '__main__':
    # Set the destination directory for frozen files
    app.config['FREEZER_DESTINATION'] = 'build'
    # Create relative URLs rather than absolute URLs
    app.config['FREEZER_RELATIVE_URLS'] = False
    
    # Generate static files
    freezer.freeze()
    
    print("Flask-Frozen has completed. Your static site is in the build directory.")
