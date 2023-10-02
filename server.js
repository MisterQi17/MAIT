//var mysql = require('mysql'); //install all the required packages for the server
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000; 

/*var connection = mysql.createConnection({ // create a sql connection to the database
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "12345",
  database: "as-relationships"
});

connection.connect((err) => { // check if the connection has created successfully
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to the database!");
  }
}); */

// Middleware to parse incoming request bodies
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.get("/home", (req,res) => {
    res.sendFile("index.html", {root: __dirname})
})

// Route to handle incoming data
app.post('/data', (req, res) => {
  const receivedData = req.body; // Data sent by the client
  const country_name = receivedData.name;
  const country_code = findCountryCode(country_name);
  
  //SQL queries
  const fetchNodesQuery = `SELECT DISTINCT target_asn, target_name, num_customers, num_peers FROM as_relationships WHERE target_country_code = '${country_code}'`;
  const fetchLinksQuery = `SELECT target_asn, neighbor_asn, relationship FROM as_relationships WHERE target_country_code = '${country_code}' AND neighbor_country_code LIKE '%${country_code}%'`;

  connection.query(fetchNodesQuery, (err, nodes) => { //Send SQL queries to the database
    if (err) {
      console.error('Error fetching nodes from MySQL:', err);
      return;
    }
  
    connection.query(fetchLinksQuery, (err, links) => {
      if (err) {
        console.error('Error fetching links from MySQL:', err);
        return;
      }
      
      // Process the nodes data and format it for visualization
      var nodesData = nodes.map(node => ({
        target_asn: node.target_asn,
        name: node.target_name,
        customer_cones: node.num_customers,
        num_peers: node.num_peers
      }));
      
      // convert node data into json files
      nodesData = JSON.stringify(nodesData);
      fs.writeFile(`./public/nodes-${country_name}.json`, nodesData, 'utf8', (err) => {
        if (err) {
          console.error('Error writing data to file:', err);
          return;
        }
      });
      
      // Process the links data and format it for visualization
      var linksData = links.map(link => ({
        source: link.target_asn,
        target: link.neighbor_asn,
        relationship: link.relationship
      }));
      
      // convert link data into json files
      linksData = JSON.stringify(linksData);
      fs.writeFile(`./public/links-${country_name}.json`, linksData, 'utf8', (err) => {
        if (err) {
          console.error('Error writing data to file:', err);
          return;
        }
      });
    });
  }); 

  // Close the MySQL connection when finished
  //connection.end();

  res.send(receivedData); // Send a response back to the client 
});

// Route to handle incoming ixp data
app.post('/ixp', (req, res) => {
  const receivedData = req.body; // Data sent by the client
  const country_name = receivedData.name;
  const country_code = findCountryCode(country_name);
  var xpList = [], asList = [];
  var nodesData = [];
  var linksData = [];

  const fetchNodesQuery = `SELECT DISTINCT target_asn, target_name, num_customers FROM as_relationships WHERE target_country_code = '${country_code}'`;

  connection.query(fetchNodesQuery, (err, nodes_data) => {
    if (err) {
      console.error('Error fetching nodes from MySQL:', err);
      return;
    }
    
    //process and format ixp data
    fs.readFile('ixp.json', 'utf8', (err, ixpData) => { 
        fs.readFile('ix-asn.json', 'utf8', (err, ixpAsData) => {
          const ixp_asn_data = JSON.parse(ixpAsData);        
          ixpData.forEach((item) => {
            if (item.country == country_code) {
              xpList.push(item);
            }
          });

          xpList.forEach((ixp) => {
            ixp_asn_data.forEach((data) => {
              nodes_data.forEach((node) => {
                if (ixp.ix_id == data.ix_id && node.target_asn == data.asn) {
                  if (!asList.includes(node)) {
                    asList.push(node);
                  }
                  linksData.push({source: data.asn, target: data.ix_id});
                }
              });
            });
          });
          
          var nodesArray = xpList.concat(asList);

          // convert data into json files that will be used in the visualization
          nodesArray.forEach(node => {
            if (node.ix_id != undefined) {
              nodesData.push({ix_id: node.ix_id, name: node.name});
            } else {
              nodesData.push({asn: node.target_asn, name: node.target_name, customer_cones: node.num_customers});
            }
          })

          nodesData = JSON.stringify(nodesData);
          fs.writeFile(`./public/ixp-nodes-${country_name}.json`, nodesData, 'utf8', (err) => {
            if (err) {
              console.error('Error writing data to file:', err);
              return;
            }
          });

          linksData = JSON.stringify(linksData);
          fs.writeFile(`./public/ixp-links-${country_name}.json`, linksData, 'utf8', (err) => {
            if (err) {
              console.error('Error writing data to file:', err);
              return;
            }
          });
        });
    });
  });
  res.send(receivedData);
});

// function to check the country code when passing country name as an argument
function findCountryCode(countryName) {
  if (countryName == 'South Africa') {
    return 'ZA';
   
  } else if (countryName == 'Tunisia') {
      return 'TN';
        
  }
  else if (countryName == 'Algeria') {
      return 'DZ';
    
  }
  else if (countryName == 'Botswana') {
      return 'BW';
       
  }
  else if (countryName == 'Benin') {
      return 'BJ';
       
  }
  else if (countryName == 'Angola') {
      return 'AO';
    
  }
  else if (countryName == 'Burkina Faso') {
      return 'BF';
       
  }
  else if (countryName == 'Burundi') {
      return 'BI';
    
  }
  else if (countryName == 'Cameroon') {
      return 'CM';
       
  }
  else if (countryName == 'Central African Rep.') {
      return 'CF';
    
  }
  else if (countryName == 'Chad') {
      return 'TD';
       
  }
  else if (countryName == 'Dem. Rep. Congo') {
      return 'CD';
     
  }
  else if (countryName == 'Congo') {
      return 'CG';
        
  }
  else if (countryName == 'Côte d\'Ivoire') {
      return 'CI';
       
  }
  else if (countryName == 'Djibouti') {
      return 'DJ';
       
  }
  else if (countryName == 'Egypt') {
      return 'EG';
        
  }
  else if (countryName == 'Eq. Guinea') {
      return 'GQ';
        
  }
  else if (countryName == 'Eritrea') {
      return 'ER';
       
  }
  else if (countryName == 'Ethiopia') {
      return 'ET';
       
  }
  else if (countryName == 'Gabon') {
      return 'GA';
        
  }
  else if (countryName == 'Gambia') {
      return 'GM';
       
  }
  else if (countryName == 'Ghana') {
      return 'GH';
       
  }
  else if (countryName == 'Guinea') {
      return 'GN';
       
  }
  else if (countryName == 'Guinea-Bissau') {
      return 'GW';
       
  }
  else if (countryName == 'Kenya') {
      return 'KE';
        
  }
  else if (countryName == 'Lesotho') {
      return 'LS';
        
  }
  else if (countryName == 'Liberia') {
      return 'LR';
        
  }
  else if (countryName == 'Libya') {
      return 'LY';
       
  }
  else if (countryName == 'Madagascar') {
      return 'MG';
       
  }
  else if (countryName == 'Mali') {
      return 'ML';
       
  }
  else if (countryName == 'Malawi') {
      return 'MW';
       
  }
  else if (countryName == 'Mauritania') {
      return 'MR';
       
  }
  else if (countryName == 'Morocco') {
      return 'MA';
       
  }
  else if (countryName == 'Mozambique') {
      return 'MZ';
       
  }
  else if (countryName == 'Namibia') {
      return 'NA';
       
  }
  else if (countryName == 'Niger') {
      return 'NE';
       
  }
  else if (countryName == 'Nigeria') {
      return 'NG';
       
  }
  else if (countryName == 'Rwanda') {
      return 'RW';
       
  }
  else if (countryName == 'Senegal') {
      return 'SN';
       
  }
  else if (countryName == 'Sierra Leone') {
      return 'SL';
       
  }
  else if (countryName == 'Somalia') {
      return 'SO';
       
  }
  else if (countryName == 'Somaliland') {
      return 'SO';
       
  } 
  else if (countryName == 'S. Sudan') {
      return 'SS';
       
  }
  else if (countryName == 'Sudan') {
      return 'SD';
       
  }
  else if (countryName == 'Swaziland') {
      return 'SZ';
       
  }
  else if (countryName == 'Tanzania') {
      return 'TZ';
       
  }
  else if (countryName == 'Togo') {
      return 'TG';
       
  }
  else if (countryName == 'Tunisia') {
      return 'TN';
       
  }
  else if (countryName == 'Uganda') {
      return 'UG';
       
  }
  else if (countryName == 'W. Sahara') {
      return 'EH';
       
  }
  else if (countryName == 'Zambia') {
      return 'ZM';
       
  }
  else if (countryName == 'Zimbabwe') {
      return 'ZW';
       
  }
}