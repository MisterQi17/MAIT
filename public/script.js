const svg = d3.select('#map'), // create a svg element for the Africa map visualization
  width = +svg.attr("width"),
  height = +svg.attr("height");

let twoAS = false;
var activeItemCount = 0;
var asRelationships = [];
document.getElementById("zoom").classList.add("active");
document.getElementById("twoAS").style.display = 'none';
document.getElementById("zoom").style.display = 'none';
  
let g = svg.append("g");

const projection = d3.geoMercator() // d3 projection to create geo paths for the map
  .scale(400)
  .translate([100, 350])
  .center([0, 5]);
const pathGenerator = d3.geoPath().projection(projection);

let zooming = d3 // create zooming functions
  .zoom()
  .scaleExtent([1, 8])
  .on("zoom", (event) => {
  g.selectAll("path").attr("transform", event.transform);
  });

let tooltip = d3 // add tooltips to the 
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

  // request africa map data from a public repository
d3.json('https://assets.codepen.io/2814973/africa.json')
.then(function(json) {
  update(json)
});

svg.call(zooming);

// function to update network topology visualization whenever user click on a country
function update(geojson) {
    g.selectAll('path')
    .data(geojson.features)
    .join('path')
    .attr('class', 'country')
    .attr('d', pathGenerator)
    .on("mouseover", (event, d) => { // when user hover over a country it will display the name of country
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`<p>${d.properties.name}</p>`)
      .style("left", event.pageX + "px")
      .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", (d) => {
      tooltip.transition().duration(500).style("opacity", 0);
    })
    .on("click", function(event, d) { 
      /*async function fetchData() {
        try {
          const response = await fetch('/data', {      
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Add any other headers you need, such as authorization tokens, etc.
            },
            body: JSON.stringify(d.properties)
          }); // Replace the URL with your API endpoint
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
      
          const data = await response.json(); // Parse the response body as JSON
          console.log(data); // Process the data as needed
          return data;
        } catch (error) {
          console.error('Error fetching data:', error);
          throw error; // Rethrow the error to handle it further up the call stack if necessary
        }
      }
      fetchData(); 

      async function fetchIXP() {
        try {
          const response = await fetch('/new_ixp', {      
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Add any other headers you need, such as authorization tokens, etc.
            },
            body: JSON.stringify(d.properties)
          }); // Replace the URL with your API endpoint
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json(); // Parse the response body as JSON
          return data;
        } catch (error) {
          console.error('Error fetching data:', error);
          throw error; // Rethrow the error to handle it further up the call stack if necessary
        }
      } 
      fetchIXP(); */

      const geoPaths = g.selectAll('path');

      // Filter the selection to get a single GeoPath based on certain criteria
      const myGeoPath = geoPaths.filter(function(d, i) {
          return d3.select(this).attr('class') === 'selectedCountry';
      });

      myGeoPath.attr('class', 'country'); // change the color back once the user selects another country 
      d3.select(this).attr('class', 'selectedCountry'); // highlight the country being selected

      const breadcrumb = document.getElementById("navigation"); 
      while (breadcrumb.firstChild) {
        breadcrumb.removeChild(breadcrumb.firstChild);
      }
      
      const listItem = document.createElement("li");
      listItem.className = "breadcrumb-item";
      listItem.textContent = d.properties.name;     
      breadcrumb.appendChild(listItem);

      // create AS relationship visualization initially
      visualize_AS_Relationships(d);
      document.getElementById("as").classList.add("active");
      document.getElementById("ixp").classList.remove("active");
      document.getElementById("asRelationship").value = "Select one of the ASes to zoom into";

      // add functions to the buttons
      d3.select("#ixp").on("click", () => {
        document.getElementById("asList").classList.remove("list-group-numbered");
        document.getElementById("filter").setAttribute("disabled", '');
        document.getElementById("asRelationship").value = "Select one of the IXPs to view all the ASes exchanging data through that IXP";
        document.getElementById("as").classList.remove("active");
        document.getElementById("ixp").classList.add("active");
        visualize_IXP_Relationships(d);
      });

      d3.select("#as").on("click", () => {
        document.getElementById("asList").classList.add("list-group-numbered");
        document.getElementById("asRelationship").value = "Select one of the ASes to zoom into";
        document.getElementById("ixp").classList.remove("active");
        document.getElementById("as").classList.add("active");
        visualize_AS_Relationships(d);
      });
    })
}

// function to visualize AS relationships
function visualize_AS_Relationships(d) {
  const breadcrumb = document.getElementById("navigation");
  const numberOfItems = breadcrumb.querySelectorAll(".breadcrumb-item").length;
  if (numberOfItems == 2) {
    breadcrumb.removeChild(breadcrumb.lastChild);
  } else if (numberOfItems > 2) {
    breadcrumb.removeChild(breadcrumb.lastChild);
    breadcrumb.removeChild(breadcrumb.lastChild);
  }

  const listItem = document.createElement("li");
  listItem.className = "breadcrumb-item";
  const linkElement = document.createElement("a");
  linkElement.href = "#";
  listItem.addEventListener("click", function() {
    visualize_AS_Relationships(d);
  });
  linkElement.textContent = "AS Relationships";
  listItem.appendChild(linkElement);
  breadcrumb.appendChild(listItem);

  document.getElementById("p2c").disabled = false;
  document.getElementById("p2p").disabled = false;
  document.getElementById("p2c").checked = true;
  document.getElementById("p2p").checked = true;
  document.getElementById("customers").disabled = false;
  document.getElementById("customers").checked = true;
  document.getElementById("peers").disabled = false;

  document.getElementById("twoAS").removeAttribute("disabled");
  document.getElementById("zoom").removeAttribute("disabled");
  document.getElementById("twoAS").style.display = 'block';
  document.getElementById("zoom").style.display = 'block';
  twoAS = false;
  document.getElementById("twoAS").classList.remove("active");
  document.getElementById("zoom").classList.add("active");

  const container = document.getElementById("viz");

  // Remove existing SVG elements inside the container
  while (container.firstChild) {
      container.removeChild(container.firstChild);
  }

  const svg2 = d3.select("#viz"), //create svg element for network topology visualization
  width2 = +svg2.attr("width"),
  height2 = +svg2.attr("height");

  // Fetch the data for nodes and links
  Promise.all([
      fetch(`nodes-${d.properties.name}.json`).then(response => response.json()),
      fetch(`links-${d.properties.name}.json`).then(response => response.json())        
    ])
      .then(([nodes_data, links_data]) => {
        if (nodes_data.length == 0) {
          alert("No Data is available for this country.");
        }

        sortAS(nodes_data);  
        addListItems();
        
        // create and add group list items to the list which displays the names of ASes next to the topology visualization
        function addListItems() {
          const listItems = document.querySelectorAll(".list-group-item");
          listItems.forEach(item => {
            item.addEventListener("click", function() {
              var badge = item.querySelector('.badge');
              var itemText = badge ? item.childNodes[0].nodeValue.trim() : item.textContent.trim();
              if (twoAS == true) {  // if users select the two AS relationship mode they will be able to view the relationships between AS
                this.classList.add("active");   
                var i =0;        
                listItems.forEach(function (item) {
                  if (item.classList.contains("active")) { // checks for which two AS that the users have selected
                    asRelationships.push(itemText)
                    i++;                   
                  }                
                });
                activeItemCount = i;
                if (activeItemCount == 2) {
                  checkRelationships(asRelationships[0],asRelationships[1]);  // checks the relationship between two AS               
                  asRelationships.length = 0;
                  listItems.forEach(function(innerItem) {
                    innerItem.classList.remove("active");
                  });
                  activeItemCount = 0;
                }
              } else { // if users select the zoom mode theu will be able to zoom into a node in the visualization
                listItems.forEach(function(innerItem) {
                  innerItem.classList.remove("active");
                });
                this.classList.add("active"); // change list group item to active when selected
                zoomIntoNode(itemText); // zoom into the node when user click on a AS name in the list

                const breadcrumb = document.getElementById("navigation");
                const numberOfItems = breadcrumb.querySelectorAll(".breadcrumb-item").length;
                if (numberOfItems > 2) {
                  breadcrumb.removeChild(breadcrumb.lastChild);
                }
  
                const listItem = document.createElement("li");
                listItem.className = "breadcrumb-item";
                listItem.textContent = item.text.replace(/\d+/g, '');                  
                breadcrumb.appendChild(listItem);
              }
            });
          });
        }

        // button for relationship mode 
        d3.select("#twoAS").on("click", () => {
          twoAS = true;
          document.getElementById("twoAS").classList.add("active");
          document.getElementById("zoom").classList.remove("active");
          const listItems = document.querySelectorAll(".list-group-item");
          listItems.forEach(function(innerItem) {
            innerItem.classList.remove("active");
          });
          const items = breadcrumb.querySelectorAll(".breadcrumb-item").length; 
          if (items > 2) {
            breadcrumb.removeChild(breadcrumb.lastChild);
          }            
          node.style("fill", "black");

          document.getElementById("filter").setAttribute("disabled", '');
          document.getElementById("asRelationship").value = "Select TWO AS to view its relationship"
        });

        //button for zoom mode
        d3.select("#zoom").on("click", () => {
          twoAS = false;
          document.getElementById("twoAS").classList.remove("active");
          document.getElementById("zoom").classList.add("active");
          document.getElementById("asRelationship").value = "Select one of the ASes to zoom into";
        });

        // function to check the relationship between two AS and tell users about the relationship
        function checkRelationships(as1,as2) {
          const node1 = nodes_data.find(n => n.name == as1);
          const node2 = nodes_data.find(n => n.name == as2);
          var textarea = document.getElementById("asRelationship");
          textarea.value = "";

          links_data.forEach((links) => {
              if (links.source == node1 && links.target == node2) { 
                textarea.value = `${node1.name} has a ${links.relationship} relationship with ${node2.name}`;
              } else if (links.source == node2 && links.target == node1){
                textarea.value = `${node1.name} has a ${links.relationship} relationship with ${node2.name}`;
              } 
          });

          if (textarea.value == "") {
            textarea.value = `There is no relationship between ${node1.name} and ${node2.name}`;
          }
        }

        // function to zoom into the node that corresponds to the AS name from the list when users select it
        function zoomIntoNode(nodeName) {
          const node = nodes_data.find(n => n.name == nodeName);
          if (node) {
            const normalNodes = d3.selectAll("circle").filter(function(d) {
              return d3.select(this).style('fill') == 'lime';
            });
            normalNodes.style("fill", "black");            
            const highlightedNode = d3.selectAll("circle").filter(function(d) {
              return d.name == node.name;
            }); 
            highlightedNode.style("fill","lime");
            svg2.transition().duration(700).call( 
            zooming.transform, d3.zoomIdentity.translate((width2 / 2), (height2 / 2)).scale(1.2).translate(-node.x, -node.y)
            );
          }
        }

        // Create the force layout using D3.js force layout
          //set up the simulation 
          var simulation = d3.forceSimulation(nodes_data); // use node data
                  
          //add forces
          var link_force =  d3.forceLink().distance(50).id(function(d) { return d.target_asn; }).links(links_data);
          simulation
              .force("charge", d3.forceManyBody().strength(-400)) //add a charge to each node 
              .force("center", d3.forceCenter(width2 / 2, height2 / 2)) //add a centering force
              .force("link",link_force);  //and a link force

                  
          //add tick instructions: 
          simulation.on("tick", tickActions );

          let tooltip = d3 // tooltip for each node
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

          //draw circles for the nodes 
          var node = svg2.append("g")
                  .attr("class", "nodes")
                  .selectAll("circle")
                  .data(nodes_data)
                  .enter()
                  .append("circle")
                  .attr("r", (d) => {
                    if (d.customer_cones <= 20) {
                      return 10;
                    } else if (d.customer_cones > 20 && d.customer_cones <= 50) {
                      return 30; 
                    } else return 50;           
                  }); 

                  // radio buttons for customers and peers options 
                  const customers = document.getElementById("customers");
                  const peers = document.getElementById("peers");

                  // when a user selects radio button for customer the size of the nodes will be based on the number of customers
                  customers.addEventListener("change",function() { 
                    if (customers.checked) {
                      node.attr("r", (d) => { // adjust the size of nodes according the number of customers
                        if (d.customer_cones <= 20) { 
                          return 10;
                        } else if (d.customer_cones > 20 && d.customer_cones <= 50) {
                          return 30; 
                        } else return 50;           
                      });
                    }
                  })

                  // when a user selects radio button for peers the size of the nodes will be based on the number of peers
                  peers.addEventListener("change",function() {
                    if (peers.checked) {
                      node.attr("r", (d) => { // adjust the size of nodes according the number of peers
                        if (d.num_peers <= 20) {
                          return 10;
                        } else if (d.num_peers > 20 && d.num_peers <= 50) {
                          return 30; 
                        } else return 50;           
                      });
                    }
                  })

                  const connectedNodes = [];

                  node.on("mouseover", (event, d) => {  // when users hover onto a node it will display the name of AS, the number of customers and peers 
                    tooltip.transition().duration(200).style("opacity", 0.9);
                    tooltip.html(`<h5><b>${d.name}</b></h3>` + `<p>Customers:<b>${d.customer_cones}</b></p>` + `<p>Peers:<b>${d.num_peers}</b></p>`)
                      .style("left", event.pageX +20 + "px")
                      .style("top", event.pageY - 50 + "px");
                  })
                  .on("mouseout", (d) => {
                    tooltip.transition().duration(500).style("opacity", 0);
                  })
                  .on("click", function(event, d) { // when users double click on a node it will show all the nodes connecting to the clicked node
                      const breadcrumb = document.getElementById("navigation");
                      const numberOfItems = breadcrumb.querySelectorAll(".breadcrumb-item").length;
                      if (numberOfItems > 2) {
                        breadcrumb.removeChild(breadcrumb.lastChild);
                      }

                      const listItem = document.createElement("li");
                      listItem.className = "breadcrumb-item";
                      listItem.textContent = d.name;                  
                      breadcrumb.appendChild(listItem);
                    
                      svg2.transition().duration(700).call( //zoom into the node when clicked
                        zooming.transform, d3.zoomIdentity.translate((width2 / 2), (height2 / 2)).scale(1.2).translate(-d.x, -d.y)
                      );

                      const clickedNode = d3.selectAll("circle").filter(function() { // change the clicked node's color to green
                          return d3.select(this).style('fill') == 'green';
                      }); 
                
                      clickedNode.style('fill', 'black'); //  change the clicked node's color back to black when another node is clicked
                      d3.select(this).style('fill', 'green');

                      connectedNodes.length = 0;
                      connectedNodes.push(d);
                      links_data.forEach((links) => { // find all the nodes connecting to the clicked node
                        if (links.source === d) { 
                          connectedNodes.push(nodes_data.find((nodes) => nodes === links.target));
                        } else if ((links.target === d) && (!connectedNodes.includes(links.target))) {
                          connectedNodes.push(nodes_data.find((nodes) => nodes === links.source));
                        }
                      });

                      // hide all the nodes and links that are not connected to the clicked node
                      node.style("display", "none");
                      link.style("display", "none");

                      connectedNodes.forEach((nodes) => { // show all the nodes that are connected to the selected node
                        const selectedNode = d3.selectAll("circle").filter((d) => d.name === nodes.name);
                        selectedNode.style("display","initial");
                      });
                    
                      const normalNodes = d3.selectAll("circle").filter(function(d) {
                        return d3.select(this).style('fill') == 'lime';
                      });
                      normalNodes.style("fill", "black"); 

                      link.filter((links) => { // show all the links that are connected to the selected node
                        return (
                          connectedNodes.find((nodes) => nodes === links.source) &&
                          connectedNodes.find((nodes) => nodes === links.target)
                        );
                      }).style("display", "initial");
                      document.getElementById("filter").removeAttribute("disabled");

                      sortAS(connectedNodes); 
                      addListItems();           
                  }); 
                                  

          //create the links for the nodes
          var link = svg2.append("g")
              .attr("class", "links")
              .selectAll("line")
              .data(links_data)
              .enter().append("line")
              .attr("stroke-width", 0.5)
              .style("stroke", linkColour) 
              .on("click", null);                        
              
          var drag_handler = d3.drag()
              .on("start", drag_start)
              .on("drag", drag_drag)
              .on("end", drag_end);	

          let zooming = d3.zoom()
              .on("zoom", (event) => {             
                node.attr("transform", event.transform);
                link.attr("transform", event.transform);
              });

          svg2.call(zooming) // call zooming function
              .call(zooming.scaleTo, 0.35)
              .on("dblclick.zoom", null);
              
          
          svg2.transition().call(zooming.translateTo, 0.5 * width2, 0.5 * height2);

          d3.select("#zoomIn").on("click", () => { // zoom in button
            svg2.transition().call(zooming.scaleBy, 2);
          });
          d3.select("#zoomOut").on("click", () => { // zoom out button
            svg2.transition().call(zooming.scaleBy, 0.5);
          });
          d3.select("#resetZoom").on("click", () => { // reset zoom level button
            const newTransform = d3.zoomIdentity
              .scale(0.45)
              .translate(0.5 * width2, 0.5 * height2);
          
            svg2.transition().call(zooming.transform, newTransform);
          });

          // switch buttons for the type of relationships between ASes
          const p2p = document.getElementById("p2p");
          const p2c = document.getElementById("p2c");

          // switch button to show or hide peer to peer relationships in the visualization 
          p2p.addEventListener("change", function() {
            if (!p2p.checked && !p2c.checked) {
              link.style("display", "none");
            } else if (p2p.checked && p2c.checked) {
              if (!document.getElementById("filter").hasAttribute("disabled")) {
                link.filter((links) => {
                  return (
                    connectedNodes.find((nodes) => nodes === links.source) &&
                    connectedNodes.find((nodes) => nodes === links.target)
                  );
                }).style("display", "initial");   
              } else {
                link.style("display", "initial");
              }               
            } else if (p2p.checked) {
              if (!document.getElementById("filter").hasAttribute("disabled")) {
                link.filter((links) => {
                  return (
                    connectedNodes.find((nodes) => nodes === links.source) &&
                    connectedNodes.find((nodes) => nodes === links.target)
                  );
                }).style("display", d => d.relationship == "p2p" ? "initial" : "none");  
              } else {
                link.style("display", d => d.relationship == "p2p" ? "initial" : "none");
              }             
            } else {
              if (!document.getElementById("filter").hasAttribute("disabled")) {
                link.filter((links) => {
                  return (
                    connectedNodes.find((nodes) => nodes === links.source) &&
                    connectedNodes.find((nodes) => nodes === links.target)
                  );
                }).style("display", d => d.relationship == "p2p" ? "none" : "initial");  
              } else {
                link.style("display", d => d.relationship == "p2p" ? "none" : "initial");
              }            
            }
          });
          
          // switch button to show or hide provider to customer relationships in the visualization
          p2c.addEventListener("change", function() {
            if (!p2p.checked && !p2c.checked) {
              link.style("display", "none");
            } else if (p2p.checked && p2c.checked) {
              if (!document.getElementById("filter").hasAttribute("disabled")) {
                link.filter((links) => {
                  return (
                    connectedNodes.find((nodes) => nodes === links.source) &&
                    connectedNodes.find((nodes) => nodes === links.target)
                  );
                }).style("display", "initial");   
              } else {
                link.style("display", "initial");
              }  
            } else if (p2c.checked) {
              if (!document.getElementById("filter").hasAttribute("disabled")) {
                link.filter((links) => {
                  return (
                    connectedNodes.find((nodes) => nodes === links.source) &&
                    connectedNodes.find((nodes) => nodes === links.target)
                  );
                }).style("display", d => d.relationship == "p2c" || d.relationship == "c2p" ? "initial" : "none");   
              } else {
                link.style("display", d => d.relationship == "p2c" || d.relationship == "c2p" ? "initial" : "none");
              }              
            } else {
              if (!document.getElementById("filter").hasAttribute("disabled")) {
                link.filter((links) => {
                  return (
                    connectedNodes.find((nodes) => nodes === links.source) &&
                    connectedNodes.find((nodes) => nodes === links.target)
                  );
                }).style("display", d => d.relationship == "p2c" || d.relationship == "c2p" ? "none" : "initial");   
              } else {
                link.style("display", d => d.relationship == "p2c" || d.relationship == "c2p" ? "none" : "initial");
              }              
            }
          });

          // button to clear filter features
          d3.select("#filter").on("click", () => { 
            const items = breadcrumb.querySelectorAll(".breadcrumb-item").length; 
            if (items > 2) {
              breadcrumb.removeChild(breadcrumb.lastChild);
            }            
            node.style("display", "initial");
            node.style("fill", "black");
            link.style("display", "initial");
            sortAS(nodes_data);
            addListItems();
            document.getElementById("filter").setAttribute("disabled", '');

            const newTransform = d3.zoomIdentity
            .scale(0.45)
            .translate(0.5 * width2, 0.5 * height2);
        
            svg2.transition().call(zooming.transform, newTransform);
          });            

          function linkColour(d){
            if(d.relationship == "p2p"){
              return "red";
            } else if (d.relationship == "c2p" || d.relationship == "p2c"){
              return "blue";
            } else {
              return "grey";
            }
          }

          //enable the nodes to become draggable
          node.call(drag_handler);

          function drag_start(event) {
              if (!event.active) simulation.alphaTarget(0.3).restart();
              event.subject.fx = event.subject.x;
              event.subject.fy = event.subject.y;
              d3.select(this).raise().style("fill", "#00FF00");
          }
          
          function drag_drag(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          }
              
          function drag_end(event) {
              if (!event.active) simulation.alphaTarget(0);
              event.subject.fx = null;
              event.subject.fy = null;
              d3.select(this).raise().style("fill", "black");
          }
                      
          function tickActions() {
              //update node positions at each tick of the simulation 
              node
                  .attr("cx", d => d.x)
                  .attr("cy", d => d.y);
                  
              //update link positions 
              //simply tells one end of the line to follow one node around
              //and the other end of the line to follow the other node around
              link
                  .attr("x1", d => d.source.x)
                  .attr("y1", d => d.source.y)
                  .attr("x2", d => d.target.x)
                  .attr("y2", d => d.target.y);
          } 
      })
      .catch(error => {
      console.error('Error fetching data:', error);
      }); 
}

// function to visualize IXP relationships
function visualize_IXP_Relationships(d) {
  const breadcrumb = document.getElementById("navigation");
  const numberOfItems = breadcrumb.querySelectorAll(".breadcrumb-item").length;
  if (numberOfItems == 2) {
    breadcrumb.removeChild(breadcrumb.lastChild);
  } else if (numberOfItems == 3) {
    breadcrumb.removeChild(breadcrumb.lastChild);
    breadcrumb.removeChild(breadcrumb.lastChild);
  } else if (numberOfItems == 4) {
    breadcrumb.removeChild(breadcrumb.lastChild);
    breadcrumb.removeChild(breadcrumb.lastChild);
    breadcrumb.removeChild(breadcrumb.lastChild);    
  }

  const listItem = document.createElement("li");
  listItem.className = "breadcrumb-item";
  const linkElement = document.createElement("a");
  linkElement.href = "#";
  listItem.addEventListener("click", function() {
    visualize_IXP_Relationships(d);
  });
  linkElement.textContent = "IXP Relationships";
  listItem.appendChild(linkElement);
  breadcrumb.appendChild(listItem);

  document.getElementById("p2c").disabled = true;
  document.getElementById("p2p").disabled = true;
  document.getElementById("customers").disabled = true;
  document.getElementById("peers").disabled = true;

  document.getElementById("twoAS").setAttribute("disabled", '');
  document.getElementById("zoom").setAttribute("disabled", '');

  const container = document.getElementById("viz");

  // Remove existing SVG elements inside the container
  while (container.firstChild) {
      container.removeChild(container.firstChild);
  }

  const svg2 = d3.select("#viz"),
  width2 = +svg2.attr("width"),
  height2 = +svg2.attr("height");

  // Fetch the data for nodes and links
  Promise.all([
      fetch(`ixp-nodes-${d.properties.name}.json`).then(response => response.json()),
      fetch(`ixp-links-${d.properties.name}.json`).then(response => response.json())         
    ])
      .then(([ixp_nodes, ixp_links]) => {

        if (ixp_nodes.length == 0) {
          alert("No Data is available for this country.");
        }

        addIXP();

        function addIXP() { // add IXP names to the list 
          const myList = document.getElementById('asList');

          while (myList.firstChild) {
            myList.removeChild(myList.firstChild);
          }
  
          for (let i=0; i<ixp_nodes.length; i++) {
            if (ixp_nodes[i].ix_id != undefined) {
              const newItem =  $('<a href="#" class="list-group-item text-primary list-group-item-action"></a>').text(ixp_nodes[i].name);
              $(myList).append(newItem);
            } 
          }
  
          const listItems = document.querySelectorAll(".list-group-item");
          listItems.forEach(item => { 
            item.addEventListener("click", function() { // highlight all the ASes that are connected to the selected IXP
              const connectedNodes = [];
              ixp_links.forEach((links) => {
                if (links.source.name === item.textContent) { 
                  connectedNodes.push(ixp_nodes.find((nodes) => nodes === links.target));
                } else if ((links.target.name === item.textContent) && (!connectedNodes.includes(links.target))) {
                  connectedNodes.push(ixp_nodes.find((nodes) => nodes === links.source));
                }
              });
    
              connectedNodes.forEach((nodes) => {  // change the color of highlighted ASes to lime
                const selectedNode = d3.selectAll("circle").filter((d) => d.name === nodes.name);
                selectedNode.style("fill", "lime");
              });

              const orangeNode = d3.selectAll("circle").filter(function(d) {
                return d3.select(this).style('fill') == 'orange';
              });
              orangeNode.style("fill", "lime");                    

              const listItem2 = document.createElement("li");
              listItem2.className = "breadcrumb-item";
              const linkElement2 = document.createElement("a");
              linkElement2.href = "#";
              listItem2.addEventListener("click", function() {
                zoomIntoIXP(item.textContent);
                if (breadcrumb.querySelectorAll(".breadcrumb-item").length == 4) {
                  breadcrumb.removeChild(breadcrumb.lastChild);
                } 
                const orange = d3.selectAll("circle").filter(function(d) {
                  return d3.select(this).style('fill') == 'orange';
                });
                orange.style("fill", "lime");
                const listItems = document.querySelectorAll(".list-group-item");
                listItems.forEach(function(innerItem) {
                  innerItem.classList.remove("active");
                });
              });
              linkElement2.textContent = item.textContent;
              listItem2.appendChild(linkElement2);                   
              breadcrumb.appendChild(listItem2);

              document.getElementById("asRelationship").value = "You haved selected " + item.textContent;
              zoomIntoIXP(item.textContent);            
              findASes(item.textContent);
            });
          });
        }

        // find all the ASes that are connected to the selected IXP 
        function findASes(IXPname) { 
          const ixp = ixp_nodes.find(n => n.name == IXPname);
          const connectedNodes = [];
          ixp_links.forEach((links) => {
          if ((links.target === ixp) && (!connectedNodes.includes(links.target))) {
              connectedNodes.push(ixp_nodes.find((nodes) => nodes === links.source));
            }
          });
          sortAS(connectedNodes);
          addListItems();
        }
        
        // create and add group list items to the list which displays the names of ASes that are connected to the selected IXP
        function addListItems() {
          const asItems = document.querySelectorAll(".list-group-item");
          asItems.forEach(item => {
            item.addEventListener("click", function() {
              asItems.forEach(function(innerItem) {
                innerItem.classList.remove("active");
              });
              this.classList.add("active"); // change list group item to active when selected
              var badge = item.querySelector('.badge');
              var itemText = badge ? item.childNodes[0].nodeValue.trim() : item.textContent.trim(); // remove badge from the list group item before filtering it
              zoomIntoNode(itemText);

              const items = breadcrumb.querySelectorAll(".breadcrumb-item").length;
              if (items == 4) {
                breadcrumb.removeChild(breadcrumb.lastChild);
              }
              const listItem3 = document.createElement("li");
              listItem3.className = "breadcrumb-item";
              listItem3.textContent = itemText;                   
              breadcrumb.appendChild(listItem3);
            });
          });
        }

        // function to zoom into the node that corresponds to the AS name from the list when users select it
        function zoomIntoNode(nodeName) {
          const node = ixp_nodes.find(n => n.name == nodeName);
          if (node) {
            const normalNodes = d3.selectAll("circle").filter(function(d) {
              return d3.select(this).style('fill') == 'orange';
            });
            normalNodes.style("fill", "lime");            
            const highlightedNode = d3.selectAll("circle").filter(function(d) {
              return d.name == node.name;
            }); 
            highlightedNode.style("fill","orange");
            svg2.transition().duration(700).call( 
            zooming.transform, d3.zoomIdentity.translate((width2 / 2), (height2 / 2)).scale(1.2).translate(-node.x, -node.y)
            );
          }
        }

        // function to zoom into the node that corresponds to the IXP name from the list when users select it
        function zoomIntoIXP(itemName) {
          const node = ixp_nodes.find(n => n.name == itemName);
          const normalNodes = d3.selectAll("circle").filter(function(d) {
            return d3.select(this).attr('stroke') == 'lime';
          });
          normalNodes.attr("stroke", "null");            
          const highlightedNode = d3.selectAll("circle").filter(function(d) {
            return d.name == node.name;
          }); 
          highlightedNode.attr("stroke","lime");      
          svg2.transition().duration(700).call(zooming.transform, d3.zoomIdentity.translate((width2 / 2), (height2 / 2)).scale(1.2).translate(-node.x, -node.y));
        }

          var simulation = d3.forceSimulation(ixp_nodes);
                  
          var link_force =  d3.forceLink().distance(50).id(function(d) { 
              if (d.ix_id == undefined) {
                return d.asn;
              } else {
                return d.ix_id;
              } 
            }).links(ixp_links); 
          simulation
              .force("charge", d3.forceManyBody().strength(-400))
              .force("center", d3.forceCenter(width2 / 2, height2 / 2))
              .force("link",link_force);

                  
          //add tick instructions: 
          simulation.on("tick", tickActions );

          let tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

          //draw circles  for the nodes 

          var node = svg2.append("g")
                  .attr("class", "nodes")
                  .selectAll("circle")
                  .data(ixp_nodes)
                  .enter()
                  .append("circle")
                  .attr("r", function(d) { // check if the node is an IXP or AS based on the node data
                    if (d.ix_id != undefined) {
                      return 30;
                    } else return 10;
                  })
                  .style("fill", function(d) {
                    if (d.ix_id != undefined) {
                      return "#0D6EFD";
                    } else return "black";
                  });

                  node.on("mouseover", (event, d) => { // display the name of IXP or AS when hovering onto it
                    tooltip.transition().duration(200).style("opacity", 0.9);
                    tooltip.html(`<p><b>Name: ${d.name}</b></p>`)
                      .style("left", event.pageX +20 + "px")
                      .style("top", event.pageY - 50 + "px");
                  })
                  .on("mouseout", (d) => {
                    tooltip.transition().duration(500).style("opacity", 0);
                  })
                  .on("click", function(event, d) {  
                    if (d.ix_id != undefined) {
                      const normalNodes = d3.selectAll("circle").filter(function(d) {
                        return d3.select(this).style('fill') == 'lime';
                      });
                      normalNodes.style("fill", "black");

                      const orangeNode = d3.selectAll("circle").filter(function(d) {
                        return d3.select(this).style('fill') == 'orange';
                      });
                      orangeNode.style("fill", "lime");                    

                      if (breadcrumb.querySelectorAll(".breadcrumb-item").length == 4) {
                        breadcrumb.removeChild(breadcrumb.lastChild);
                      } 

                      if (breadcrumb.querySelectorAll(".breadcrumb-item").length == 3) {  
                        breadcrumb.removeChild(breadcrumb.lastChild);
                      }

                      const listItem2 = document.createElement("li");
                      listItem2.className = "breadcrumb-item";
                      const linkElement2 = document.createElement("a");
                      linkElement2.href = "#";
                      listItem2.addEventListener("click", function() {
                        zoomIntoIXP(d.name);
                        if (breadcrumb.querySelectorAll(".breadcrumb-item").length == 4) {
                          breadcrumb.removeChild(breadcrumb.lastChild);
                        } 
                        const orange = d3.selectAll("circle").filter(function(d) {
                          return d3.select(this).style('fill') == 'orange';
                        });
                        orange.style("fill", "lime");
                        const listItems = document.querySelectorAll(".list-group-item");
                        listItems.forEach(function(innerItem) {
                          innerItem.classList.remove("active");
                        });
                      });
                      linkElement2.textContent = d.name;
                      listItem2.appendChild(linkElement2);                   
                      breadcrumb.appendChild(listItem2);

                      const connectedNodes = [];
                      ixp_links.forEach((links) => {
                        if (links.source == d) { 
                          connectedNodes.push(ixp_nodes.find((nodes) => nodes === links.target));
                        } else if ((links.target == d) && (!connectedNodes.includes(links.target))) {
                          connectedNodes.push(ixp_nodes.find((nodes) => nodes === links.source));
                        }
                      });

                      connectedNodes.forEach((nodes) => {
                        const selectedNode = d3.selectAll("circle").filter((d) => d.name === nodes.name);
                        selectedNode.style("fill", "lime");
                      });
                      
                      zoomIntoIXP(d.name);
                      sortAS(connectedNodes);
                      addListItems();
                      document.getElementById("asRelationship").value = "You haved selected " + d.name;
                    }
                  }); 

          //draw lines for the links 
          var link = svg2.append("g")
              .attr("class", "links")
              .selectAll("line")
              .data(ixp_links)
              .enter().append("line")
              .style("stroke-width", 0.5)
              .style("stroke-opacity", 0.7)
              .style("stroke", "black");     
                          
              
          var drag_handler = d3.drag()
              .on("start", drag_start)
              .on("drag", drag_drag)
              .on("end", drag_end);	

          let zooming = d3
              .zoom()
              .on("zoom", (event) => {
                node.attr("transform", event.transform);
                link.attr("transform", event.transform);
              });

          svg2.call(zooming)
              .call(zooming.scaleTo, 0.35)
              .on("dblclick.zoom", null);     
          
          svg2.transition().call(zooming.translateTo, 0.5 * width2, 0.5 * height2);

          d3.select("#zoomIn").on("click", () => {
            svg2.transition().call(zooming.scaleBy, 2);
          });
          d3.select("#zoomOut").on("click", () => {
            svg2.transition().call(zooming.scaleBy, 0.5);
          });
          d3.select("#resetZoom").on("click", () => {
            const newTransform = d3.zoomIdentity
            .scale(0.45)
            .translate(0.5 * width2, 0.5 * height2);
        
            svg2.transition().call(zooming.transform, newTransform);
          });
          d3.select("#hide").on("click", () => {
            link.style("display", "none");
          });
          d3.select("#show").on("click", () => {               
            link.style("display", "initial");
          });

              
          node.call(drag_handler);

          function drag_start(event) {
              if (!event.active) simulation.alphaTarget(0.3).restart();
              event.subject.fx = event.subject.x;
              event.subject.fy = event.subject.y;
          }
          
          function drag_drag(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          }
              
          function drag_end(event) {
              if (!event.active) simulation.alphaTarget(0);
              event.subject.fx = null;
              event.subject.fy = null;
          }
                      
          function tickActions() {
              //update circle positions each tick of the simulation 
              node
                  .attr("cx", d => d.x)
                  .attr("cy", d => d.y);
                  
              //update link positions 
              //simply tells one end of the line to follow one node around
              //and the other end of the line to follow the other node around
              link
                  .attr("x1", d => d.source.x)
                  .attr("y1", d => d.source.y)
                  .attr("x2", d => d.target.x)
                  .attr("y2", d => d.target.y);
                  } 
      })
      .catch(error => {
      console.error('Error fetching data:', error);
      }); 
}

// function to sort ASes based on the number of customers and create a list of AS names
function sortAS(nodes_data) {
  var as_list = [];
  var final_list = [];
  for (let i=0; i<nodes_data.length; i++) {
    as_list.push(nodes_data[i].customer_cones);
  }
  as_list.sort((a, b) => b - a);
  for (let i=0; i<as_list.length; i++) {
    for (let j=0; j<nodes_data.length; j++) {
      if (nodes_data[j].customer_cones == as_list[i] && (!final_list.includes(nodes_data[j]))) {
        final_list.push(nodes_data[j]);
      }
    }
  }
  const myList = document.getElementById('asList');

  while (myList.firstChild) {
    myList.removeChild(myList.firstChild);
  }

  for (let i=0; i<final_list.length; i++) { //create list group items for the nodes (ASes)
    const newItem =  $('<a href="#" class="list-group-item list-group-item-action"></a>').text(final_list[i].name);
    if (final_list[i].target_asn != undefined) {
      const badge = $('<span class="badge bg-primary rounded-pill"></span>').text(final_list[i].target_asn);
      $(newItem).append(badge);
    } else {
      const badge = $('<span class="badge bg-primary rounded-pill"></span>').text(final_list[i].asn);
      $(newItem).append(badge);
    }
    $(myList).append(newItem);
  }

  // jquery which allows users to search for a specific AS based on its name
  $(document).ready(function(){
    $("#searchInput").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#asList a").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
  });
}
