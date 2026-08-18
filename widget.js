(function () {
  const HOST = "https://umak-programs.netlify.app";
  let rawPrograms = [];

  function getSubgroup(item) {
    if (!item) return null;
    const val = item.sub_group || item.subgroup || item.sub_Group;
    return (val && typeof val === 'string' && val.trim() !== '') ? val.trim() : null;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("college-selector");
    if (!container) return;

    // Inject HTML Scaffolding
    container.innerHTML = `
      <div style="margin-bottom: 15px;">
        <label style="display:block; font-weight:bold; margin-bottom: 5px;">1. Select College:</label>
        <select id="umak-college" name="college_id" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
          <option value="">-- Loading Colleges... --</option>
        </select>
      </div>

      <div style="margin-bottom: 15px;">
        <label id="umak-d2-label" style="display:block; font-weight:bold; margin-bottom: 5px;">2. Select Program / Sub Group:</label>
        <select id="umak-dropdown2" disabled style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
          <option value="">-- Select College First --</option>
        </select>
      </div>

      <div id="umak-d3-container" style="display:none; margin-bottom: 15px;">
        <label style="display:block; font-weight:bold; margin-bottom: 5px;">3. Select Specific Program:</label>
        <select id="umak-dropdown3" name="program_id" disabled style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
          <option value="">-- Select Sub Group First --</option>
        </select>
      </div>
    `;

    const collegeSelect = document.getElementById("umak-college");
    const d2Select = document.getElementById("umak-dropdown2");
    const d3Select = document.getElementById("umak-dropdown3");

    // Load Colleges
    fetch(`${HOST}/.netlify/functions/get-colleges`)
      .then(res => res.json())
      .then(colleges => {
        if (!Array.isArray(colleges) || colleges.length === 0) {
          collegeSelect.innerHTML = '<option value="">No colleges found</option>';
          return;
        }

        colleges.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        collegeSelect.innerHTML = '<option value="">-- Select College --</option>';

        colleges.forEach(c => {
          const rawCode = c.college_code || c.code || "";
          const code = rawCode.trim().toUpperCase();
          const name = (c.name || c.college_name || "College").trim();
          const option = document.createElement("option");
          option.value = c.id || c.college_id;
          option.textContent = code ? `${code} (${name})` : name;
          collegeSelect.appendChild(option);
        });
      })
      .catch(() => {
        collegeSelect.innerHTML = '<option value="">Error loading colleges</option>';
      });

    // Handle College Change
    collegeSelect.addEventListener("change", async () => {
      const collegeId = collegeSelect.value;
      const d2Label = document.getElementById("umak-d2-label");
      const d3Container = document.getElementById("umak-d3-container");

      d2Select.innerHTML = '<option value="">-- Select --</option>';
      d3Select.innerHTML = '<option value="">-- Select Sub Group First --</option>';
      d3Select.disabled = true;
      d3Container.style.display = "none";

      if (!collegeId) {
        d2Select.disabled = true;
        return;
      }

      try {
        const res = await fetch(`${HOST}/.netlify/functions/get-programs?college_id=${collegeId}`);
        rawPrograms = await res.json();

        if (!Array.isArray(rawPrograms) || rawPrograms.length === 0) {
          d2Select.innerHTML = '<option value="">No programs available</option>';
          d2Select.disabled = true;
          return;
        }

        const uniqueSubgroups = [...new Set(rawPrograms.map(getSubgroup).filter(Boolean))]
          .sort((a, b) => a.localeCompare(b));

        if (uniqueSubgroups.length > 0) {
          d2Label.textContent = "2. Select Sub Group:";
          d2Select.removeAttribute("name");
          d2Select.innerHTML = '<option value="">-- Select Sub Group --</option>';

          uniqueSubgroups.forEach(sg => {
            const option = document.createElement("option");
            option.value = sg;
            option.textContent = sg;
            d2Select.appendChild(option);
          });

          d2Select.onchange = loadSubgroupPrograms;
          d2Select.disabled = false;
          d3Container.style.display = "block";
        } else {
          d2Label.textContent = "2. Select Program:";
          d2Select.setAttribute("name", "program_id");
          d2Select.innerHTML = '<option value="">-- Select Program --</option>';

          const sorted = [...rawPrograms].sort((a, b) => (a.program || "").localeCompare(b.program || ""));
          sorted.forEach(p => {
            const option = document.createElement("option");
            option.value = p.id;
            option.textContent = p.program;
            d2Select.appendChild(option);
          });

          d2Select.onchange = null;
          d2Select.disabled = false;
        }
      } catch (err) {
        console.error("Error loading programs:", err);
      }
    });

    // Populate Subgroup Programs
    function loadSubgroupPrograms() {
      const selectedSubgroup = d2Select.value;
      d3Select.innerHTML = '<option value="">-- Select Program --</option>';

      if (!selectedSubgroup) {
        d3Select.disabled = true;
        return;
      }

      const matches = rawPrograms
        .filter(p => getSubgroup(p) === selectedSubgroup)
        .sort((a, b) => (a.program || "").localeCompare(b.program || ""));

      matches.forEach(p => {
        const option = document.createElement("option");
        option.value = p.id;
        option.textContent = p.program;
        d3Select.appendChild(option);
      });

      d3Select.disabled = false;
    }
  });
})();