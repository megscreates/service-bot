const { App } = require('@slack/bolt');
const { materialCategories, getPluralLabel, getSingularLabel, getQuantityLabel } = require('./materials');

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
  if (error.code === 'slack_webapi_rate_limited') {
    console.log('⚠️ Rate limited by Slack API - waiting before retry');
    if (error.retry_after) {
      await new Promise(resolve => setTimeout(resolve, error.retry_after * 1000));
    }
  }
});

// Helper functions
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
function formatMaterialsList(materials) {
  let materialText = '';
  materials.forEach((mat) => {
    const prefix = "»";
    const qty = parseFloat(mat.qty);
    materialText += `${prefix}   *${mat.label}* — ${mat.qty} ${getQuantityLabel(mat.unit, qty)}\n`;
  });
  return materialText;
}
function getCurrentFormattedDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} at ${hours}:${minutes}`;
}
function formatTechniciansList(technicians) {
  return technicians.map(tech => `<@${tech}>`).join(', ');
}
function getCategoryIndexByName(name) {
  return materialCategories.findIndex(category => category.name === name);
}
function formatNumber(num) {
  return parseFloat(num).toFixed(2);
}
function getTruckNumber(truckValue) {
  return truckValue.replace(/^TRUCK00/, '');
}
function generateAcumaticaImportCSV(data) {
  let csvContent = 'Tran. Type,Branch,Inventory ID,Warehouse,Location,Quantity,UOM,Reason Code,Project Task,Cost Code\n';
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
  return csvContent;
}

// STEP 1: Job Channel + Category Selection + Job Details
app.command('/service', async ({ ack, body, client }) => {
  await ack();
  if (body.text.trim().toLowerCase() === "checkout") {
    console.log('Service checkout command triggered by user:', body.user_id);

    try {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);

      const categoryOptions = materialCategories.map((category, index) => ({
        text: { type: "plain_text", text: category.name, emoji: true },
        value: `${index}`
      }));

      const everydayBasicsIndex = getCategoryIndexByName("Everyday Basics");
      const adhesivesIndex = getCategoryIndexByName("Adhesives, Sealants, & Coatings");
      const initialCategories = [];
      if (everydayBasicsIndex !== -1) {
        initialCategories.push({
          text: { type: "plain_text", text: "Everyday Basics", emoji: true },
          value: `${everydayBasicsIndex}`
        });
      }
      if (adhesivesIndex !== -1) {
        initialCategories.push({
          text: { type: "plain_text", text: "Adhesives, Sealants, & Coatings", emoji: true },
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
              text: { type: "mrkdwn", text: "Select a job channel and enter job details:" }
            },
            {
              type: "input",
              block_id: "job_channel",
              element: {
                type: "conversations_select",
                placeholder: { type: "plain_text", text: "Select a job channel", emoji: true },
                action_id: "job_channel_selected",
                filter: { include: ["public", "private"] }
              },
              label: { type: "plain_text", text: "Job Channel", emoji: true }
            },
            {
              type: "input",
              block_id: "service_date",
              element: {
                type: "datepicker",
                initial_date: dateStr,
                placeholder: { type: "plain_text", text: "Select date", emoji: true },
                action_id: "service_date_selected"
              },
              label: { type: "plain_text", text: "Service Date", emoji: true }
            },
            {
              type: "input",
              block_id: "service_truck",
              element: {
                type: "static_select",
                placeholder: { type: "plain_text", text: "Select service truck", emoji: true },
                options: [
                  { text: { type: "plain_text", text: "Service Truck 63", emoji: true }, value: "TRUCK0063" },
                  { text: { type: "plain_text", text: "Service Truck 64", emoji: true }, value: "TRUCK0064" },
                  { text: { type: "plain_text", text: "Service Truck 74", emoji: true }, value: "TRUCK0074" },
                  { text: { type: "plain_text", text: "Service Truck 85", emoji: true }, value: "TRUCK0085" },
                  { text: { type: "plain_text", text: "Service Truck 91", emoji: true }, value: "TRUCK0091" }
                ],
                action_id: "service_truck_selected"
              },
              label: { type: "plain_text", text: "Service Truck", emoji: true }
            },
            {
              type: "input",
              block_id: "technicians",
              element: {
                type: "multi_users_select",
                initial_users: [body.user_id],
                placeholder: { type: "plain_text", text: "Select technicians", emoji: true },
                action_id: "technicians_selected"
              },
              label: { type: "plain_text", text: "Technicians", emoji: true }
            },
            {
              type: "input",
              block_id: "drive_hours",
              element: {
                type: "plain_text_input",
                action_id: "drive_hours_input",
                placeholder: { type: "plain_text", text: "e.g. 2.5", emoji: true }
              },
              label: { type: "plain_text", text: "Drive Hours (per tech)", emoji: true }
            },
            {
              type: "input",
              block_id: "labor_hours",
              element: {
                type: "plain_text_input",
                action_id: "labor_hours_input",
                placeholder: { type: "plain_text", text: "e.g. 4.5", emoji: true }
              },
              label: { type: "plain_text", text: "Labor Hours (per tech)", emoji: true }
            },
            {
              type: "input",
              block_id: "categories",
              element: {
                type: "multi_static_select",
                placeholder: { type: "plain_text", text: "Choose categories", emoji: true },
                initial_options: initialCategories,
                options: categoryOptions,
                action_id: "categories_selected"
              },
              label: { type: "plain_text", text: "Material Categories", emoji: true }
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
  } else {
    await client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: "Try `/service checkout` to log materials used on a job."
    });
  }
});

// STEP 2: Job Channel + Category Selection Modal Handler
app.view('job_and_category_select', async ({ ack, body, view, client }) => {
  try {
    await ack();
    console.log('Raw modal values:', JSON.stringify(view.state.values, null, 2));
    console.log('Job and category selection acknowledged');

    const jobChannelId = view.state.values.job_channel?.job_channel_selected?.selected_conversation || null;
    const serviceDate = view.state.values.service_date?.service_date_selected?.selected_date || '';
    const serviceTruck = view.state.values.service_truck?.service_truck_selected?.selected_option?.value || '';
    const serviceTruckText = view.state.values.service_truck?.service_truck_selected?.selected_option?.text?.text || '';
    const technicians = view.state.values.technicians?.technicians_selected?.selected_users || [];
    const driveHours = view.state.values.drive_hours?.drive_hours_input?.value || "0";
    const laborHours = view.state.values.labor_hours?.labor_hours_input?.value || "0";
    const selectedCategoryIndexes = view.state.values.categories?.categories_selected?.selected_options?.map(opt => parseInt(opt.value, 10)) || [];

    console.log('Extracted jobChannelId:', jobChannelId);
    console.log('Extracted selectedCategoryIndexes:', selectedCategoryIndexes);

    if (!jobChannelId || selectedCategoryIndexes.length === 0) {
      await client.chat.postEphemeral({
        channel: body.user.id,
        user: body.user.id,
        text: "Please select a job channel and at least one category"
      });
      return;
    }

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
          { type: "mrkdwn", text: "Select materials from each category:" }
        ]
      }
    ];
    selectedCategoryIndexes.forEach((categoryIndex) => {
      const category = materialCategories[categoryIndex];
      blocks.push({
        type: "input",
        block_id: `category_${categoryIndex}`,
        element: {
          type: "multi_static_select",
          action_id: `materials_${categoryIndex}`,
          placeholder: { type: "plain_text", text: "Choose materials", emoji: true },
          options: category.items.map(item => ({
            text: { type: "plain_text", text: item.label, emoji: true },
            value: item.id
          }))
        },
        label: { type: "plain_text", text: category.name, emoji: true }
      });
    });

    console.log('Opening materials_select_modal with blocks:', blocks);

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
  } catch (error) {
    console.error('Error handling job_and_category_select:', error);
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

// STEP 3: Materials Selection Modal Handler - FIXED (Only ack with update, never just ack!)
app.view('materials_select_modal', async ({ ack, body, view, client }) => {
  try {
    // LOG raw modal values for debugging
    console.log('Raw modal values (materials_select_modal):', JSON.stringify(view.state.values, null, 2));

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

    // Get selected material IDs from all categories
    const selectedMaterials = [];
    materialCategories.forEach((category, index) => {
      const categoryBlock = view.state.values[`category_${index}`];
      if (categoryBlock && categoryBlock[`materials_${index}`] && categoryBlock[`materials_${index}`].selected_options) {
        categoryBlock[`materials_${index}`].selected_options.forEach(option => {
          selectedMaterials.push(option.value);
        });
      }
    });

    console.log(`Selected ${selectedMaterials.length} materials`);

    if (selectedMaterials.length === 0) {
      await ack({
        response_action: "errors",
        errors: {
          "category_0": "Please select at least one material"
        }
      });
      return;
    }
    if (selectedMaterials.length > 20) {
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
          placeholder: {
            type: "plain_text",
            text: "Enter amount"
          }
        }
      };
    }).filter(block => block !== null);

    // IMPORTANT: Only call ack ONCE, with modal update
    await ack({
      response_action: "update",
      view: {
        type: "modal",
        callback_id: "quantity_entry_modal",
        private_metadata: JSON.stringify({ 
          selectedIds: selectedMaterials, 
          jobChannelId,
          user: body.user.id,
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
              text: `*Job:* <#${jobChannelId}>\n\n*Service Date:* ${serviceDate}\n\n*Enter the quantity used for each material:*` 
            }
          },
          ...quantityBlocks
        ]
      }
    });
    console.log('Quantity entry modal opened via view update');
  } catch (error) {
    console.error('Error updating to quantity entry modal:', error);
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

// STEP 4: Quantity Entry Modal Handler
app.view('quantity_entry_modal', async ({ ack, view, body, client }) => {
  try {
    await ack();
    console.log('Raw modal values (quantity_entry_modal):', JSON.stringify(view.state.values, null, 2));

    const metadata = JSON.parse(view.private_metadata);
    const selectedIds = metadata.selectedIds;
    const jobChannelId = metadata.jobChannelId;
    const userId = metadata.user;
    const serviceDate = metadata.serviceDate;
    const serviceTruck = metadata.serviceTruck;
    const serviceTruckText = metadata.serviceTruckText;
    const technicians = metadata.technicians;
    const driveHours = metadata.driveHours;
    const laborHours = metadata.laborHours;
    const lunchTaken = metadata.lunchTaken;
    const values = view.state.values;

    console.log(`Processing ${selectedIds.length} materials with quantities`);

    const materialsWithQty = [];
    for (const id of selectedIds) {
      const mat = getMaterialById(id);
      if (!mat) continue;
      const qtyBlock = values[`qty_${id}`];
      const qtyRaw = qtyBlock ? qtyBlock.quantity_input.value : "0";
      let qty = parseFloat(qtyRaw);
      qty = isNaN(qty) ? 0 : qty;
      if (qty === 0) {
        console.log(`Item ${id} has quantity 0, skipping`);
        continue;
      }
      if (qty < 0.5) {
        qty = 0.5;
        console.log(`Item ${id} quantity rounded up to 0.5`);
      } else if (qty > 987) {
        qty = 987;
        console.log(`Item ${id} quantity capped at 987`);
      }
      qty = Math.round(qty * 100) / 100;
      materialsWithQty.push({
        id,
        label: mat.label,
        unit: mat.unit,
        qty: qty.toString()
      });
    }

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
              text: `*Job:* <#${jobChannelId}>\n\n*Service Date:* ${serviceDate}`
            }
          },
          {
            type: "input",
            block_id: "job_status",
            element: {
              type: "static_select",
              placeholder: { type: "plain_text", text: "Select job status", emoji: true },
              options: [
                { text: { type: "plain_text", text: "100% Complete", emoji: true }, value: "100% Complete" },
                { text: { type: "plain_text", text: "Return Visit Needed", emoji: true }, value: "Return Visit Needed" },
                { text: { type: "plain_text", text: "Need to Reschedule", emoji: true }, value: "Need to Reschedule" }
              ],
              action_id: "job_status_selected"
            },
            label: { type: "plain_text", text: "Job Status", emoji: true }
          },
          {
            type: "input",
            block_id: "billing_status",
            element: {
              type: "static_select",
              placeholder: { type: "plain_text", text: "Select billing status", emoji: true },
              options: [
                { text: { type: "plain_text", text: "100% Billable", emoji: true }, value: "100% Billable" },
                { text: { type: "plain_text", text: "100% Warranty", emoji: true }, value: "100% Warranty" },
                { text: { type: "plain_text", text: "Partially Billable (See Notes)", emoji: true }, value: "Partially Billable (See Notes)" },
                { text: { type: "plain_text", text: "Job not completed", emoji: true }, value: "Job not completed" }
              ],
              action_id: "billing_status_selected"
            },
            label: { type: "plain_text", text: "Billing Status", emoji: true }
          },
          {
            type: "input",
            block_id: "scope_of_work",
            element: {
              type: "plain_text_input",
              multiline: true,
              placeholder: { type: "plain_text", text: "Type the scope of work here...", emoji: true },
              action_id: "scope_input"
            },
            label: { type: "plain_text", text: "Scope of Work", emoji: true }
          }
        ]
      }
    });
    console.log('Job status modal opened via view update');
  } catch (error) {
    console.error('Error updating to job status modal:', error);
    await ack({
      response_action: "errors",
      errors: { "qty_": "Something went wrong. Please try again." }
    });
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

// STEP 5: Job Status Modal Handler
app.view('job_status_modal', async ({ ack, view, body, client }) => {
  try {
    await ack();
    console.log('Raw modal values (job_status_modal):', JSON.stringify(view.state.values, null, 2));

    const metadata = JSON.parse(view.private_metadata);
    const { materialsWithQty, userId, jobChannelId } = metadata;
    const serviceDate = metadata.serviceDate;
    const serviceTruck = metadata.serviceTruck;
    const serviceTruckText = metadata.serviceTruckText;
    const technicians = metadata.technicians;
    const driveHours = metadata.driveHours;
    const laborHours = metadata.laborHours;
    const lunchTaken = metadata.lunchTaken;
    const truckNumber = getTruckNumber(serviceTruck);

    const jobStatus = view.state.values.job_status.job_status_selected.selected_option.value;
    const billingStatus = view.state.values.billing_status.billing_status_selected.selected_option.value;
    const scopeOfWork = view.state.values.scope_of_work.scope_input.value;

    const techCount = technicians.length || 1;
    const driveHoursPerTech = parseFloat(driveHours) || 0;
    const laborHoursPerTech = parseFloat(laborHours) || 0;
    const totalDriveHours = driveHoursPerTech * techCount;
    const totalLaborHours = laborHoursPerTech * techCount;
    const formattedDrivePerTech = formatNumber(driveHoursPerTech);
    const formattedLaborPerTech = formatNumber(laborHoursPerTech);
    const formattedTotalDrive = formatNumber(totalDriveHours);
    const formattedTotalLabor = formatNumber(totalLaborHours);
    const timestamp = getCurrentFormattedDateTime();
    const techniciansList = formatTechniciansList(technicians);
    const formattedMaterials = formatMaterialsList(materialsWithQty);
    const formattedScope = scopeOfWork ? scopeOfWork.split('\n').map(line => `> ${line}`).join('\n') : "> None provided";

    await ack({
      response_action: "update",
      view: {
        type: "modal",
        callback_id: "review_modal",
        private_metadata: JSON.stringify({ 
          materialsWithQty,
          userId, 
          jobChannelId,
          serviceDate,
          serviceTruck,
          serviceTruckText,
          truckNumber,
          technicians,
          driveHours: formattedDrivePerTech,
          laborHours: formattedLaborPerTech,
          lunchTaken,
          totalDriveHours: formattedTotalDrive,
          totalLaborHours: formattedTotalLabor,
          jobStatus,
          billingStatus,
          scopeOfWork,
          timestamp
        }),
        title: { type: "plain_text", text: "Review Submission" },
        submit: { type: "plain_text", text: "Submit" },
        close: { type: "plain_text", text: "Cancel" },
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: "EOD Service Summary", emoji: true }
          },
          {
            type: "context",
            elements: [
              { type: "mrkdwn", text: `*Submitted By:* <@${userId}> at ${timestamp}` }
            ]
          },
          { type: "divider" },
          { type: "section", text: { type: "mrkdwn", text: `*Job:* <#${jobChannelId}>` } },
          { type: "section", text: { type: "mrkdwn", text: `*Service Date:* ${serviceDate}` } },
          { type: "section", text: { type: "mrkdwn", text: `*Service Truck:* ${truckNumber}` } },
          { type: "section", text: { type: "mrkdwn", text: `*Technicians:* ${techniciansList}` } },
          { type: "divider" },
          { type: "section", text: { type: "mrkdwn", text: `*Job Status:* ${jobStatus}` } },
          { type: "section", text: { type: "mrkdwn", text: `*Billing Status:* ${billingStatus}` } },
          { type: "divider" },
          { type: "section", text: { type: "mrkdwn", text: "*Scope of Work:*" } },
          { type: "section", text: { type: "mrkdwn", text: formattedScope } },
          { type: "divider" },
          { type: "section", text: { type: "mrkdwn", text: "*Labor:*" } },
          { type: "section", text: { type: "mrkdwn", text: `»   *Drive Hours:* ${formattedDrivePerTech} per tech — ${formattedTotalDrive} total\n»   *Labor Hours:* ${formattedLaborPerTech} per tech — ${formattedTotalLabor} total` } },
          { type: "divider" },
          { type: "section", text: { type: "mrkdwn", text: "*Materials:*" } },
          { type: "section", text: { type: "mrkdwn", text: formattedMaterials } },
          { type: "divider" },
          {
            type: "input",
            block_id: "internal_notes",
            optional: true,
            element: {
              type: "plain_text_input",
              multiline: true,
              placeholder: { type: "plain_text", text: "Enter any additional notes here...", emoji: true },
              action_id: "notes_input"
            },
            label: { type: "plain_text", text: "Internal Notes", emoji: true }
          }
        ]
      }
    });
    console.log('Review modal opened via view update');
  } catch (error) {
    console.error('Error updating to review modal:', error);
    await ack({
      response_action: "errors",
      errors: { "job_status": "Something went wrong. Please try again." }
    });
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

// STEP 6: Review Modal Handler
app.view('review_modal', async ({ ack, body, view, client }) => {
  await ack();
  console.log('Review submission acknowledged successfully');
  try {
    console.log('Raw modal values (review_modal):', JSON.stringify(view.state.values, null, 2));
    const metadata = JSON.parse(view.private_metadata);
    const { materialsWithQty, userId, jobChannelId } = metadata;
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
    const internalNotes = view.state.values.internal_notes?.notes_input?.value || "";

    console.log(`Posting ${materialsWithQty.length} materials to channel ${jobChannelId}`);
    const formattedMaterials = formatMaterialsList(materialsWithQty);
    const techniciansList = formatTechniciansList(technicians);
    const formattedScope = scopeOfWork ? scopeOfWork.split('\n').map(line => `> ${line}`).join('\n') : "> None provided";
    const formattedNotes = internalNotes ? internalNotes.split('\n').map(line => `> ${line}`).join('\n') : "";
    let channelName = "";
    try {
      const channelInfo = await client.conversations.info({ channel: jobChannelId });
      channelName = channelInfo.channel.name;
      console.log('Retrieved channel name:', channelName);
    } catch (error) {
      console.error("Couldn't get channel info:", error);
      channelName = jobChannelId;
    }
    const currentTimestamp = getCurrentFormattedDateTime();
    const acumaticaData = {
      serviceTruck,
      materials: materialsWithQty.map(mat => ({
        itemId: mat.id,
        description: mat.label,
        quantity: parseFloat(mat.qty),
        unit: mat.unit
      }))
    };
    const csvContent = generateAcumaticaImportCSV(acumaticaData);
    console.log("CSV generated successfully");
    const messageResponse = await client.chat.postMessage({
      channel: jobChannelId,
      text: `EOD Service Summary for ${channelName} submitted by <@${userId}>`,
      blocks: [
        {
          type: "image",
          image_url: "https://github.com/megscreates/service-bot/blob/main/rra%20service%20summary%20banner.png?raw=true",
          alt_text: "EOD Service Summary"
        },
        {
          type: "context",
          elements: [ { type: "mrkdwn", text: `*Submitted By:* <@${userId}> at ${currentTimestamp}` } ]
        },
        { type: "divider" },
        { type: "section", text: { type: "mrkdwn", text: `*Job:* <#${jobChannelId}>` } },
        { type: "section", text: { type: "mrkdwn", text: `*Service Date:* ${serviceDate}` } },
        { type: "section", text: { type: "mrkdwn", text: `*Service Truck:* ${truckNumber}` } },
        { type: "section", text: { type: "mrkdwn", text: `*Technicians:* ${techniciansList}` } },
        { type: "divider" },
        { type: "section", text: { type: "mrkdwn", text: `*Job Status:* ${jobStatus}` } },
        { type: "section", text: { type: "mrkdwn", text: `*Billing Status:* ${billingStatus}` } },
        { type: "divider" },
        { type: "section", text: { type: "mrkdwn", text: "*Scope of Work:*" } },
        { type: "section", text: { type: "mrkdwn", text: formattedScope } },
        { type: "divider" },
        { type: "section", text: { type: "mrkdwn", text: "*Labor:*" } },
        { type: "section", text: { type: "mrkdwn", text: `»   *Drive Hours:* ${driveHours} per tech — ${totalDriveHours} total\n»   *Labor Hours:* ${laborHours} per tech — ${totalLaborHours} total` } },
        { type: "divider" },
        { type: "section", text: { type: "mrkdwn", text: "*Materials:*" } },
        { type: "section", text: { type: "mrkdwn", text: formattedMaterials } },
        ...(internalNotes ? [
          { type: "divider" },
          { type: "section", text: { type: "mrkdwn", text: `*Internal Notes from <@${userId}>:*` } },
          { type: "section", text: { type: "mrkdwn", text: formattedNotes } }
        ] : []),
        { type: "divider" }
      ]
    });
    console.log('Message posted to channel successfully');
    const cleanDate = serviceDate.replace(/-/g, '');
    const filename = `${channelName}_${cleanDate}_inv_issue.csv`;
    console.log('Posting CSV as text to channel:', jobChannelId);
    await client.chat.postMessage({
      channel: jobChannelId,
      text: `Material Usage Report for Acumatica import:`,
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: `*Material Usage Report for Acumatica*\n\nHere's the CSV data to copy/paste into your import file:` }
        },
        {
          type: "section",
          text: { type: "mrkdwn", text: "```\n" + csvContent + "```" }
        }
      ],
      thread_ts: messageResponse.ts
    });
    console.log('CSV data posted as text');
    console.log('Sending confirmation to user:', userId);
    await client.chat.postMessage({
      channel: userId,
      text: `EOD Service Summary submitted to ${channelName}`,
      blocks: [
        { type: "section", text: { type: "mrkdwn", text: `✅ EOD Service Summary submitted to <#${jobChannelId}>` } }
      ]
    });
    console.log('Confirmation sent to user');
  } catch (error) {
    console.error('Error processing review submission:', error);
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
