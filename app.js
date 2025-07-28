const { App } = require('@slack/bolt');
const { materialCategories, getPluralLabel, getSingularLabel, getQuantityLabel } = require('./materials');
const ExcelJS = require('exceljs'); // Add ExcelJS for file generation

// Initialize the app with what we need
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: !!process.env.SLACK_APP_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  customRoutes: [
    {
      path: '/',
      method: ['GET'],
      handler: (req, res) => {
        res.writeHead(200);
        res.end('Service Bot is running!');
      },
    }
  ]
});

// Add logging middleware to help debug request flow
app.use(async ({ logger, next }) => {
  console.log('Request received:', new Date().toISOString());
  await next();
  console.log('Request processed:', new Date().toISOString());
});

// Single consolidated error handler
app.error(async (error) => {
  console.error('SLACK APP ERROR:', error);
  
  // Specific handling for rate limit errors
  if (error.code === 'slack_webapi_rate_limited') {
    console.log('⚠️ Rate limited by Slack API - waiting before retry');
    // Wait for the retry_after period if specified
    if (error.retry_after) {
      await new Promise(resolve => setTimeout(resolve, error.retry_after * 1000));
    }
  }
});

// Helper: Get material info by id
function getMaterialById(id) {
  for (const category of materialCategories) {
    for (const material of category.items) {
      if (material.id === id) {
        return material;
      }
    }
  }
  return null;
}

// Helper: Format materials with filled circles and proper spacing
function formatMaterialsList(materials) {
  let materialText = '';
  
  materials.forEach((mat) => {
    // Use arrow instead of numbers
    const prefix = "»";
    
    // Handle quantity as float now instead of integer
    const qty = parseFloat(mat.qty);
    materialText += `${prefix}   *${mat.label}* — ${mat.qty} ${getQuantityLabel(mat.unit, qty)}\n`;
  });
  
  return materialText;
}

// Helper: Get current time in format YYYY-MM-DD at HH:MM
function getCurrentFormattedDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} at ${hours}:${minutes}`;
}

// Helper: Format technicians as a list with arrows
function formatTechniciansList(technicians) {
  return technicians.map(tech => `»   <@${tech}>`).join('\n');
}

// Helper function to find category index by name
function getCategoryIndexByName(name) {
  return materialCategories.findIndex(category => category.name === name);
}

// Helper function to format number with 2 decimal places
function formatNumber(num) {
  return parseFloat(num).toFixed(2);
}

// Helper function to get just the truck number (e.g., "63" from "TRUCK0063")
function getTruckNumber(truckValue) {
  // Extract just the digits from the end
  return truckValue.replace(/^TRUCK00/, '');
}

// Helper function to generate Acumatica import file
async function generateAcumaticaImportFile(data) {
  try {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Material Issue');
    
    // Add headers for Acumatica import
    worksheet.columns = [
      { header: 'Tran. Type', key: 'tranType' },
      { header: 'Branch', key: 'branch' },      // Added Branch
      { header: 'Inventory ID', key: 'inventoryId' },
      { header: 'Warehouse', key: 'warehouse' }, // Added Warehouse 
      { header: 'Location', key: 'location' },   // Added Location
      { header: 'Quantity', key: 'quantity' },   // Added Quantity
      { header: 'UOM', key: 'uom' },
      { header: 'Reason Code', key: 'reasonCode' },
      { header: 'Project Task', key: 'projectTask' },
      { header: 'Cost Code', key: 'costCode' },
    ];
    
    // Add row for each material
    data.materials.forEach(material => {
      worksheet.addRow({
        tranType: "ISSUE",
        branch: "11100",
        inventoryId: material.itemId,
        warehouse: "0001",
        location: data.serviceTruck,
        quantity: material.quantity,
        uom: "", // leave blank for now
        reasonCode: "ISSUE",
        projectTask: "13",
        costCode: "0000"
      });
    });
    
    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    return buffer;
  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw error;
  }
}

// Helper function to generate CSV as a backup option
async function generateAcumaticaImportCSV(data) {
  try {
    // CSV header
    let csvContent = 'Tran. Type,Branch,Inventory ID,Warehouse,Location,Quantity,UOM,Reason Code,Project Task,Cost Code\n';
    
    // Add rows for materials
    data.materials.forEach(material => {
      csvContent += [
        "ISSUE",
        "11100",
        material.itemId,
        "0001",
        data.serviceTruck,
        material.quantity,
        "", // UOM left blank
        "ISSUE",
        "13",
        "0000"
      ].join(',') + '\n';
    });
    
    // Return as buffer
    return Buffer.from(csvContent, 'utf8');
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw error;
  }
}

// STEP 1: Job Channel + Category Selection + Job Details
app.command('/materials', async ({ ack, body, client }) => {
  await ack();
  console.log('Materials command triggered by user:', body.user_id);

  try {
    // Get today's date in YYYY-MM-DD format for default
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);

    // Create category options for multi-select
    const categoryOptions = materialCategories.map((category, index) => ({
      text: {
        type: "plain_text",
        text: category.name,
        emoji: true
      },
      value: `${index}`
    }));
    
    // Find indexes of categories to auto-select
    const everydayBasicsIndex = getCategoryIndexByName("Everyday Basics");
    const adhesivesIndex = getCategoryIndexByName("Adhesives, Sealants, & Coatings");
    
    // Create initial selection options
    const initialCategories = [];
    
    if (everydayBasicsIndex !== -1) {
      initialCategories.push({
        text: {
          type: "plain_text",
          text: "Everyday Basics",
          emoji: true
        },
        value: `${everydayBasicsIndex}`
      });
    }
    
    if (adhesivesIndex !== -1) {
      initialCategories.push({
        text: {
          type: "plain_text",
          text: "Adhesives, Sealants, & Coatings",
          emoji: true
        },
        value: `${adhesivesIndex}`
      });
    }

    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "job_and_category_select",
        title: { type: "plain_text", text: "Materials Used" },
        submit: { type: "plain_text", text: "Next" },
        close: { type: "plain_text", text: "Cancel" },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Select a job channel and enter job details:"
            }
          },
          {
            type: "input",
            block_id: "job_channel",
            element: {
              type: "channels_select",
              placeholder: {
                type: "plain_text",
                text: "Select a job channel",
                emoji: true
              },
              action_id: "job_channel_selected"
            },
            label: {
              type: "plain_text",
              text: "Job Channel",
              emoji: true
            }
          },
          {
            type: "input",
            block_id: "service_date",
            element: {
              type: "datepicker",
              initial_date: dateStr,
              placeholder: {
                type: "plain_text",
                text: "Select date",
                emoji: true
              },
              action_id: "service_date_selected"
            },
            label: {
              type: "plain_text",
              text: "Service Date",
              emoji: true
            }
          },
          {
            type: "input",
            block_id: "service_truck",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select service truck",
                emoji: true
              },
              options: [
                {
                  text: {
                    type: "plain_text",
                    text: "Service Truck 63",
                    emoji: true
                  },
                  value: "TRUCK0063"
                },
                {
                  text: {
                    type: "plain_text",
                    text: "Service Truck 64",
                    emoji: true
                  },
                  value: "TRUCK0064"
                },
                {
                  text: {
                    type: "plain_text",
                    text: "Service Truck 74",
                    emoji: true
                  },
                  value: "TRUCK0074"
                },
                {
                  text: {
                    type: "plain_text",
                    text: "Service Truck 85",
                    emoji: true
                  },
                  value: "TRUCK0085"
                },
                {
                  text: {
                    type: "plain_text",
                    text: "Service Truck 91",
                    emoji: true
                  },
                  value: "TRUCK0091"
                }
              ],
              action_id: "service_truck_selected"
            },
            label: {
              type: "plain_text",
              text: "Service Truck",
              emoji: true
            }
          },
          {
            type: "input",
            block_id: "technicians",
            element: {
              type: "multi_users_select",
              initial_users: [body.user_id], // Auto-include the submitter
              placeholder: {
                type: "plain_text",
                text: "Select technicians",
                emoji: true
              },
              action_id: "technicians_selected"
            },
            label: {
              type: "plain_text",
              text: "Technicians",
              emoji: true
            }
          },
          {
            type: "input",
            block_id: "drive_hours",
            element: {
              type: "plain_text_input",
              action_id: "drive_hours_input",
              placeholder: {
                type: "plain_text",
                text: "e.g. 2.5",
                emoji: true
              }
            },
            label: {
              type: "plain_text",
              text: "Drive Hours (per tech)",
              emoji: true
            }
          },
          {
            type: "input",
            block_id: "labor_hours",
            element: {
              type: "plain_text_input",
              action_id: "labor_hours_input",
              placeholder: {
                type: "plain_text",
                text: "e.g. 4.5",
                emoji: true
              }
            },
            label: {
              type: "plain_text",
              text: "Labor Hours (per tech)",
              emoji: true
            }
          },
          {
            type: "input",
            block_id: "categories",
            element: {
              type: "multi_static_select",
              placeholder: {
                type: "plain_text",
                text: "Choose categories",
                emoji: true
              },
              initial_options: initialCategories,
              options: categoryOptions,
              action_id: "categories_selected"
            },
            label: {
              type: "plain_text",
              text: "Material Categories",
              emoji: true
            }
          }
        ]
      }
    });
  } catch (err) {
    console.error('Error opening selection modal:', err);
    try {
      await client.chat.postMessage({
        channel: body.user_id,
        text: `Sorry, something went wrong. Please try again!`
      });
    } catch (dmError) {
      console.error('Error sending error notification:', dmError);
    }
  }
});

// STEP 2: Show materials from ONLY selected categories - FIXED VERSION
app.view('job_and_category_select', async ({ ack, body, view, client }) => {
  try {
    // First acknowledge quickly to prevent timeout
    await ack();
    console.log('Job and category selection acknowledged');
    
    // Get the selected job channel
    const jobChannelId = view.state.values.job_channel.job_channel_selected.selected_channel;
    
    // Get the new fields
    const serviceDate = view.state.values.service_date.service_date_selected.selected_date;
    const serviceTruck = view.state.values.service_truck.service_truck_selected.selected_option.value;
    const serviceTruckText = view.state.values.service_truck.service_truck_selected.selected_option.text.text;
    const technicians = view.state.values.technicians.technicians_selected.selected_users || [];
    const driveHours = view.state.values.drive_hours.drive_hours_input.value || "0";
    const laborHours = view.state.values.labor_hours.labor_hours_input.value || "0";
    
    // Get selected categories
    const selectedCategoryIndexes = view.state.values.categories.categories_selected.selected_options.map(opt => 
      parseInt(opt.value, 10)
    );
    
    if (!jobChannelId || selectedCategoryIndexes.length === 0) {
      // Show error message to user
      await client.chat.postEphemeral({
        channel: body.user.id,
        user: body.user.id,
        text: "Please select a job channel and at least one category"
      });
      return;
    }

    // Create blocks for the selected categories only
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Job:* <#${jobChannelId}>\n*Service Date:* ${serviceDate}`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "Select materials from each category:"
          }
        ]
      }
    ];

    // Add ONLY the selected categories as separate multi-select inputs
    selectedCategoryIndexes.forEach((categoryIndex, index) => {
      const category = materialCategories[categoryIndex];
      
      // Add a divider between categories
      if (index > 0) {
        blocks.push({
          type: "divider"
        });
      }

      // Use the category name directly as the label - no separate header needed
      blocks.push({
        type: "input",
        block_id: `category_${categoryIndex}`,
        element: {
          type: "multi_static_select",
          action_id: `materials_${categoryIndex}`,
          placeholder: {
            type: "plain_text",
            text: "Choose materials",
            emoji: true
          },
          options: category.items.map(item => ({
            text: {
              type: "plain_text",
              text: item.label,
              emoji: true
            },
            value: item.id
          }))
        },
        label: {
          type: "plain_text",
          text: category.name,
          emoji: true
        }
      });
    });

    // Open a new view instead of updating the existing one
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "materials_select_modal",
        private_metadata: JSON.stringify({ 
          jobChannelId,
          selectedCategoryIndexes,
          serviceDate,
          serviceTruck,
          serviceTruckText,
          technicians,
          driveHours,
          laborHours,
          lunchTaken: false
        }),
        title: { type: "plain_text", text: "Select Materials" },
        submit: { type: "plain_text", text: "Next" },
        close: { type: "plain_text", text: "Cancel" },
        blocks: blocks
      }
    });
    
    console.log('Materials selection modal opened with selected categories only');
  } catch (error) {
    console.error('Error handling job_and_category_select:', error);
    
    // Try to notify the user about the error
    try {
      await client.chat.postMessage({
        channel: body.user.id,
        text: `Sorry, something went wrong. Please try again!`
      });
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError);
    }
  }
});

// -------- STEP 3: Quantity Entry Modal --------
app.view('materials_select_modal', async ({ ack, body, view, client }) => {
  try {
    console.log('Processing materials selection from user:', body.user.id);
    
    // Get previous metadata
    const metadata = JSON.parse(view.private_metadata || '{}');
    const jobChannelId = metadata.jobChannelId;
    const serviceDate = metadata.serviceDate;
    const serviceTruck = metadata.serviceTruck;
    const serviceTruckText = metadata.serviceTruckText;
    const technicians = metadata.technicians;
    const driveHours = metadata.driveHours;
    const laborHours = metadata.laborHours;
    const lunchTaken = metadata.lunchTaken;
    
    console.log('Job channel from metadata:', jobChannelId);
    
    // Get selected material IDs from all categories
    const selectedMaterials = [];
    
    materialCategories.forEach((category, index) => {
      const categoryBlock = view.state.values[`category_${index}`];
      
      if (categoryBlock && categoryBlock[`materials_${index}`] && 
          categoryBlock[`materials_${index}`].selected_options) {
        categoryBlock[`materials_${index}`].selected_options.forEach(option => {
          selectedMaterials.push(option.value);
        });
      }
    });
    
    console.log(`Selected ${selectedMaterials.length} materials`);

    if (selectedMaterials.length === 0) {
      // No materials selected - error
      await ack({
        response_action: "errors",
        errors: {
          "category_0": "Please select at least one material"
        }
      });
      return;
    }
    
    // Add check for maximum items - keeping to 20 for now
    if (selectedMaterials.length > 20) {
      // Too many materials - error
      await ack({
        response_action: "errors",
        errors: {
          "category_0": "Please select no more than 20 materials"
        }
      });
      return;
    }

    // Build quantity entry blocks (one input per material)
    const quantityBlocks = selectedMaterials.map(id => {
      const mat = getMaterialById(id);
      if (!mat) return null;
      
      // Simplify 'per each' to just 'each'
      const unitLabel = mat.unit === 'each' ? 'each' : `per ${getSingularLabel(mat.unit)}`;
      
      return {
        type: "input",
        block_id: `qty_${id}`,
        label: {
          type: "plain_text",
          text: `${mat.label}  -  ${unitLabel}`,
          emoji: true
        },
        element: {
          type: "plain_text_input",
          action_id: "quantity_input",
          // Removed initial_value: "1"
          placeholder: {
            type: "plain_text",
            text: "Enter amount"
          }
          // No subtype property!
        }
      };
    }).filter(block => block !== null);
    
    // IMPORTANT: Update view directly in the acknowledgment
    await ack({
      response_action: "update",
      view: {
        type: "modal",
        callback_id: "quantity_entry_modal",
        private_metadata: JSON.stringify({ 
          selectedIds: selectedMaterials, 
          jobChannelId,
          user: body.user.id,
          // Pass through the job details
          serviceDate,
          serviceTruck,
          serviceTruckText,
          technicians,
          driveHours,
          laborHours,
          lunchTaken
        }),
        title: { type: "plain_text", text: "Enter Quantities" },
        submit: { type: "plain_text", text: "Next" },
        close: { type: "plain_text", text: "Cancel" },
        blocks: [
          {
            type: "section",
            text: { 
              type: "mrkdwn", 
              text: `*Job:* <#${jobChannelId}>\n*Service Date:* ${serviceDate}\n\n*Enter the quantity used for each material:*` 
            }
          },
          ...quantityBlocks
        ]
      }
    });
    
    console.log('Quantity entry modal opened via view update');
  } catch (error) {
    console.error('Error updating to quantity entry modal:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    
    // Acknowledge with basic response to prevent timeouts
    try {
      await ack({
        response_action: "errors",
        errors: {
          "category_0": "Something went wrong. Please try again."
        }
      });
    } catch (ackError) {
      console.error('Error with acknowledgment:', ackError);
    }
    
    // Try to notify the user
    try {
      await client.chat.postMessage({
        channel: body.user.id,
        text: `Sorry, something went wrong when handling materials. Please try again!`
      });
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError);
    }
  }
});

// -------- STEP 4: Job Status + Scope of Work Modal --------
app.view('quantity_entry_modal', async ({ ack, view, body, client }) => {
  try {
    console.log('Processing quantities from user:', body.user.id);
    
    // Validate and parse quantities
    const metadata = JSON.parse(view.private_metadata);
    const selectedIds = metadata.selectedIds;
    const jobChannelId = metadata.jobChannelId;
    const userId = metadata.user;
    
    // Get job details
    const serviceDate = metadata.serviceDate;
    const serviceTruck = metadata.serviceTruck;
    const serviceTruckText = metadata.serviceTruckText;
    const technicians = metadata.technicians;
    const driveHours = metadata.driveHours;
    const laborHours = metadata.laborHours;
    const lunchTaken = metadata.lunchTaken;
    
    const values = view.state.values;
    
    console.log(`Processing ${selectedIds.length} materials with quantities`);

    // Build material/quantity list and validate
    const materialsWithQty = [];
    
    for (const id of selectedIds) {
      const mat = getMaterialById(id);
      if (!mat) continue;
      
      const qtyBlock = values[`qty_${id}`];
      const qtyRaw = qtyBlock ? qtyBlock.quantity_input.value : "0";
      
      // Convert to number with parseFloat (for decimal support)
      let qty = parseFloat(qtyRaw);
      qty = isNaN(qty) ? 0 : qty;
      
      // Skip this item if quantity is 0 (remove it)
      if (qty === 0) {
        console.log(`Item ${id} has quantity 0, skipping`);
        continue;
      }
      
      // Apply our validation rules
      if (qty < 0.5) {
        // Round up to minimum
        qty = 0.5;
        console.log(`Item ${id} quantity rounded up to 0.5`);
      }
      else if (qty > 987) {
        // Cap at maximum
        qty = 987;
        console.log(`Item ${id} quantity capped at 987`);
      }
      
      // Format to max 2 decimal places
      qty = Math.round(qty * 100) / 100;
      
      // Add to processed list
      materialsWithQty.push({
        id,
        label: mat.label,
        unit: mat.unit,
        qty: qty.toString() // Convert back to string for consistency
      });
    }
    
    // If all materials were removed (all quantities were 0)
    if (materialsWithQty.length === 0) {
      console.log('All quantities were zero - showing error');
      await ack({
        response_action: "errors",
        errors: {
          [`qty_${selectedIds[0]}`]: "Please enter at least one valid quantity"
        }
      });
      return;
    }

    // Update view for job status and scope of work
    await ack({
      response_action: "update",
      view: {
        type: "modal",
        callback_id: "job_status_modal",
        private_metadata: JSON.stringify({
          materialsWithQty,
          userId,
          jobChannelId,
          serviceDate,
          serviceTruck,
          serviceTruckText,
          technicians,
          driveHours,
          laborHours,
          lunchTaken
        }),
        title: { type: "plain_text", text: "Job Details" },
        submit: { type: "plain_text", text: "Review" },
        close: { type: "plain_text", text: "Cancel" },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Job:* <#${jobChannelId}>\n*Service Date:* ${serviceDate}`
            }
          },
          {
            type: "input",
            block_id: "job_status",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select job status",
                emoji: true
              },
              options: [
                {
                  text: {
                    type: "plain_text",
                    text: "100% Complete",
                    emoji: true
                  },
                  value: "100% Complete"
                },
                {
                  text: {
                    type: "plain_text",
                    text: "Return Visit Needed",
                    emoji: true
                  },
                  value: "Return Visit Needed"
                },
                {
                  text: {
                    type: "plain_text",
                    text: "Need to Reschedule",
                    emoji: true
                  },
                  value: "Need to Reschedule"
                }
              ],
              action_id: "job_status_selected"
            },
            label: {
              type: "plain_text",
              text: "Job Status",
              emoji: true
            }
          },
          {
            type: "input",
            block_id: "billing_status",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select billing status",
                emoji: true
              },
              options: [
                {
                  text: {
                    type: "plain_text",
                    text: "100% Billable",
                    emoji: true
                  },
                  value: "100% Billable"
                },
                {
                  text: {
                    type: "plain_text",
                    text: "100% Warranty",
                    emoji: true
                  },
                  value: "100% Warranty"
                },
                {
                  text: {
                    type: "plain_text",
                    text: "Partially Billable (See Notes)",
                    emoji: true
                  },
                  value: "Partially Billable (See Notes)"
                },
                {
                  text: {
                    type: "plain_text",
                    text: "Job not completed",
                    emoji: true
                  },
                  value: "Job not completed"
                }
              ],
              action_id: "billing_status_selected"
            },
            label: {
              type: "plain_text",
              text: "Billing Status",
              emoji: true
            }
          },
          {
            type: "input",
            block_id: "scope_of_work",
            element: {
              type: "plain_text_input",
              multiline: true,
              placeholder: {
                type: "plain_text",
                text: "Type the scope of work here...",
                emoji: true
              },
              action_id: "scope_input"
            },
            label: {
              type: "plain_text",
              text: "Scope of Work",
              emoji: true
            }
          }
        ]
      }
    });
    
    console.log('Job status modal opened via view update');
  } catch (error) {
    console.error('Error updating to job status modal:', error);
    
    // Acknowledge with basic response to prevent timeouts
    await ack({
      response_action: "errors",
      errors: {
        "qty_": "Something went wrong. Please try again."
      }
    });
    
    // Try to notify the user
    try {
      await client.chat.postMessage({
        channel: body.user.id,
        text: `Sorry, something went wrong when processing quantities. Please try again!`
      });
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError);
    }
  }
});

// -------- STEP 5: Review Modal --------
app.view('job_status_modal', async ({ ack, view, body, client }) => {
  try {
    console.log('Processing job status from user:', body.user.id);
    
    // Get metadata from previous view
    const metadata = JSON.parse(view.private_metadata);
    const { materialsWithQty, userId, jobChannelId } = metadata;
    
    // Get job details
    const serviceDate = metadata.serviceDate;
    const serviceTruck = metadata.serviceTruck;
    const serviceTruckText = metadata.serviceTruckText;
    const technicians = metadata.technicians;
    const driveHours = metadata.driveHours;
    const laborHours = metadata.laborHours;
    const lunchTaken = metadata.lunchTaken;
    
    // Get the truck number for display
    const truckNumber = getTruckNumber(serviceTruck);
    
    // Get job status details
    const jobStatus = view.state.values.job_status.job_status_selected.selected_option.value;
    const billingStatus = view.state.values.billing_status.billing_status_selected.selected_option.value;
    const scopeOfWork = view.state.values.scope_of_work.scope_input.value;
    
    // Calculate total hours based on tech count
    const techCount = technicians.length || 1;
    const driveHoursPerTech = parseFloat(driveHours) || 0;
    const laborHoursPerTech = parseFloat(laborHours) || 0;
    const totalDriveHours = driveHoursPerTech * techCount;
    const totalLaborHours = laborHoursPerTech * techCount;
    
    // Format hours with 2 decimal places always
    const formattedDrivePerTech = formatNumber(driveHoursPerTech);
    const formattedLaborPerTech = formatNumber(laborHoursPerTech);
    const formattedTotalDrive = formatNumber(totalDriveHours);
    const formattedTotalLabor = formatNumber(totalLaborHours);
    
    // Get current date and time for the timestamp
    const timestamp = getCurrentFormattedDateTime();
    
    // Format technicians as a list with arrows
    const techniciansList = formatTechniciansList(technicians);
    
    // Format the materials with filled circles and proper spacing
    const formattedMaterials = formatMaterialsList(materialsWithQty);
    
    console.log('Updating view for final review');

    // Update the current view
    await ack({
      response_action: "update",
      view: {
        type: "modal",
        callback_id: "review_modal",
        private_metadata: JSON.stringify({ 
          materialsWithQty,
          userId, 
          jobChannelId,
          // Include job details
          serviceDate,
          serviceTruck,
          serviceTruckText,
          truckNumber,
          technicians,
          driveHours: formattedDrivePerTech,
          laborHours: formattedLaborPerTech,
          lunchTaken,
          // Include calculated totals
          totalDriveHours: formattedTotalDrive,
          totalLaborHours: formattedTotalLabor,
          // Include job status details
          jobStatus,
          billingStatus,
          scopeOfWork,
          // Timestamp for post
          timestamp
        }),
        title: { type: "plain_text", text: "Review Submission" },
        submit: { type: "plain_text", text: "Submit" },
        close: { type: "plain_text", text: "Cancel" },
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "EOD Service Summary",
              emoji: true
            }
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `*Submitted By:* <@${userId}> at ${timestamp}`
              }
            ]
          },
          {
            type: "divider"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Job:* <#${jobChannelId}>`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Service Date:* ${serviceDate}`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Service Truck:* ${truckNumber}`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Technicians:*\n\n" + techniciansList
            }
          },
          {
            type: "divider"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Job Status:* ${jobStatus}`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Billing Status:* ${billingStatus}`
            }
          },
          {
            type: "divider"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Scope of Work:*"
            }
          },
          {
            type: "section",
            text: {
              type: "plain_text",
              text: scopeOfWork || "None provided",
              emoji: true
            }
          },
          {
            type: "divider"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Labor:*"
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `»   *Drive Hours:* ${formattedDrivePerTech} per tech — ${formattedTotalDrive} total\n»   *Labor Hours:* ${formattedLaborPerTech} per tech — ${formattedTotalLabor} total`
              // Removed lunch taken and replaced parentheses with em dash
            }
          },
          {
            type: "divider"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Materials:*"
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: formattedMaterials
            }
          },
          {
            type: "divider"
          },
          {
            type: "input",
            block_id: "internal_notes",
            optional: true,
            element: {
              type: "plain_text_input",
              multiline: true,
              placeholder: {
                type: "plain_text",
                text: "Enter any additional notes here...",
                emoji: true
              },
              action_id: "notes_input"
            },
            label: {
              type: "plain_text",
              text: "Internal Notes",
              emoji: true
            }
          }
        ]
      }
    });
    
    console.log('Review modal opened via view update');
  } catch (error) {
    console.error('Error updating to review modal:', error);
    
    // Acknowledge with basic response to prevent timeouts
    await ack({
      response_action: "errors",
      errors: {
        "job_status": "Something went wrong. Please try again."
      }
    });
    
    // Try to notify the user
    try {
      await client.chat.postMessage({
        channel: body.user.id,
        text: `Sorry, something went wrong. Please try again!`
      });
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError);
    }
  }
});

// -------- STEP 6: Submit and Post to Job Channel --------
app.view('review_modal', async ({ ack, body, view, client }) => {
  await ack();
  console.log('Review submission acknowledged successfully');
  
  try {
    console.log('Processing review submission from user:', body.user.id);
    
    // Get the data from private_metadata
    const metadata = JSON.parse(view.private_metadata);
    const { materialsWithQty, userId, jobChannelId } = metadata;
    
    // Get job details
    const serviceDate = metadata.serviceDate;
    const serviceTruck = metadata.serviceTruck;
    const truckNumber = metadata.truckNumber;
    const technicians = metadata.technicians;
    const driveHours = metadata.driveHours;
    const laborHours = metadata.laborHours;
    const lunchTaken = metadata.lunchTaken;
    const totalDriveHours = metadata.totalDriveHours;
    const totalLaborHours = metadata.totalLaborHours;
    const jobStatus = metadata.jobStatus;
    const billingStatus = metadata.billingStatus;
    const scopeOfWork = metadata.scopeOfWork;
    
    // Get internal notes from the review modal
    const internalNotes = view.state.values.internal_notes.notes_input.value || "";
    
    console.log(`Posting ${materialsWithQty.length} materials to channel ${jobChannelId}`);

    // Format the materials list with the same helper function
    const formattedMaterials = formatMaterialsList(materialsWithQty);
    
    // Format technicians as a list with arrows
    const techniciansList = formatTechniciansList(technicians);

    // Get job channel name for better display
    let channelName = "";
    try {
      const channelInfo = await client.conversations.info({ channel: jobChannelId });
      channelName = channelInfo.channel.name;
      console.log('Retrieved channel name:', channelName);
    } catch (error) {
      console.error("Couldn't get channel info:", error);
      channelName = jobChannelId;
    }

    // Get current timestamp at posting time
    const currentTimestamp = getCurrentFormattedDateTime();
    
    // Prepare data for Acumatica import
    const acumaticaData = {
      jobChannel: channelName,
      jobChannelId,
      submittedBy: userId,
      serviceDate,
      serviceTruck,
      technicians,
      driveHoursPerTech: parseFloat(driveHours) || 0,
      laborHoursPerTech: parseFloat(laborHours) || 0,
      totalDriveHours: parseFloat(totalDriveHours) || 0,
      totalLaborHours: parseFloat(totalLaborHours) || 0,
      lunchTaken,
      jobStatus,
      billingStatus,
      scopeOfWork,
      internalNotes,
      timestamp: currentTimestamp,
      materials: materialsWithQty.map(mat => ({
        itemId: mat.id,
        description: mat.label,
        quantity: parseFloat(mat.qty),
        unit: mat.unit
      }))
    };
    
    // Try to generate Excel file first, fall back to CSV if it fails
    let fileBuffer;
    let fileExtension = 'xlsx';
    try {
      fileBuffer = await generateAcumaticaImportFile(acumaticaData);
      console.log("Excel file generated successfully");
    } catch (excelError) {
      console.error("Error generating Excel file, trying CSV:", excelError);
      try {
        fileBuffer = await generateAcumaticaImportCSV(acumaticaData);
        fileExtension = 'csv';
        console.log("CSV generated as fallback");
      } catch (csvError) {
        console.error("Error generating CSV file:", csvError);
      }
    }

    // Post the formatted message to the job channel
    console.log('Posting message to channel:', jobChannelId);
    await client.chat.postMessage({
      channel: jobChannelId,
      text: `EOD Service Summary for ${channelName} submitted by <@${userId}>`,
      blocks: [
        {
          type: "divider"
        },
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "EOD Service Summary",
            emoji: true
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `*Submitted By:* <@${userId}> at ${currentTimestamp}`
            }
          ]
        },
        {
          type: "divider"
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Job:* <#${jobChannelId}>`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Service Date:* ${serviceDate}`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Service Truck:* ${truckNumber}`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Technicians:*\n\n" + techniciansList
          }
        },
        {
          type: "divider"
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Job Status:* ${jobStatus}`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Billing Status:* ${billingStatus}`
          }
        },
        {
          type: "divider"
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Scope of Work:*"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: scopeOfWork ? scopeOfWork.replace(/- /g, "»   ") : "None provided"
          }
        },
        {
          type: "divider"
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Labor:*"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `»   *Drive Hours:* ${driveHours} per tech — ${totalDriveHours} total\n»   *Labor Hours:* ${laborHours} per tech — ${totalLaborHours} total`
            // Removed lunch taken and replaced parentheses with em dash
          }
        },
        {
          type: "divider"
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Materials:*"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: formattedMaterials
          }
        },
        // Moved internal notes to be after materials
        ...(internalNotes ? [
          {
            type: "divider"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Internal Notes from <@${userId}>:*`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: internalNotes.replace(/- /g, "»   ")
            }
          },
        ] : []),
        {
          type: "divider"
        }
      ]
    });
    console.log('Message posted to channel successfully');
    
// If file was generated successfully, upload it
if (fileBuffer) {
  try {
    // Format filename
    const cleanDate = serviceDate.replace(/-/g, '');
    const filename = `${channelName}_${cleanDate}_inv_issue.${fileExtension}`;
    
    // Try target channel first, then job channel as fallback
    let importChannelId = process.env.ACUMATICA_IMPORT_CHANNEL;
    let uploadSucceeded = false;
    
    // First try the configured import channel
    if (importChannelId && importChannelId.trim() !== '') {
      try {
        console.log(`Trying to upload to configured channel ${importChannelId}`);
        await client.files.upload({
          channels: importChannelId,
          file: fileBuffer,
          filename: filename,
          title: `Material Usage for ${channelName} on ${serviceDate}`,
          initial_comment: `Material usage report for <#${jobChannelId}> ready for Acumatica import.`
        });
        uploadSucceeded = true;
        console.log('File uploaded successfully to import channel');
      } catch (importChannelError) {
        console.log('Could not upload to import channel, will try job channel');
        if (importChannelError.data && importChannelError.data.error === 'not_in_channel') {
          // Specific handling for not_in_channel error
          console.log('Bot is not in the import channel - need to invite the bot first');
        }
      }
    }
    
    // If import channel failed, try job channel as fallback
    if (!uploadSucceeded) {
      console.log(`Falling back to job channel ${jobChannelId} for file upload`);
      await client.files.upload({
        channels: jobChannelId, // Use job channel as fallback
        file: fileBuffer,
        filename: filename,
        title: `Material Usage for ${channelName} on ${serviceDate}`,
        initial_comment: `Material usage report ready for Acumatica import.`
      });
      console.log('File uploaded successfully to job channel');
    }
  } catch (uploadError) {
    console.error('All file upload attempts failed:', uploadError);
    
    // Notify user
    await client.chat.postMessage({
      channel: userId,
      text: `⚠️ There was an issue uploading the Acumatica import file. Please make sure the bot is invited to the target channel with \`/invite @service-bot\`.`
    });
  }
}

    // Confirm to the user in a DM
    console.log('Sending confirmation to user:', userId);
    await client.chat.postMessage({
      channel: userId,
      text: `EOD Service Summary submitted to ${channelName}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `✅ EOD Service Summary submitted to <#${jobChannelId}>`
          }
        }
      ]
    });
    console.log('Confirmation sent to user');
  } catch (error) {
    console.error('Error processing review submission:', error);
    
    // Try to notify the user about the error
    try {
      await client.chat.postMessage({
        channel: body.user.id,
        text: `Sorry, there was an error submitting your EOD Service Summary. Please try again!`
      });
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError);
    }
  }
});

// Start the app
(async () => {
  try {
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Service Bot is running on port', process.env.PORT || 3000);
  } catch (error) {
    console.error('Failed to start app:', error);
  }
})();
