import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Content.css";

const Content = () => {
  const [pdfLinks, setPdfLinks] = useState([]);
  const [selectedCategoryItems, setSelectedCategoryItems] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [showContentP, setShowContentP] = useState(true);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const role = sessionStorage.getItem("userRole");
        const subRole = sessionStorage.getItem("usersubRole");
        const response = await axios.get("http://localhost:5001/get-pdfs", {
          params: { role: role || "", subRole: subRole || "" },
        });

        if (response.data.pdfs) {
          // group by category
          const grouped = response.data.pdfs.reduce((acc, pdf) => {
            const category = pdf.category || "Uncategorized";
            if (!acc[category]) acc[category] = [];
            acc[category].push(pdf);
            return acc;
          }, {});

          // ensure default subcategories for each category (Documents / Announcements)
          const categories = Object.keys(grouped).map((cat) => {
            const items = [...grouped[cat]];
            const hasDocuments = items.some((it) => it.subcategory === "Documents");
            const hasAnnouncements = items.some((it) => it.subcategory === "Announcements");

            if (!hasDocuments) {
              items.push({
                name: "No documents uploaded yet",
                category: cat,
                subcategory: "Documents",
                filePath: null,
              });
            }
            if (!hasAnnouncements) {
              items.push({
                name: "No announcements uploaded yet",
                category: cat,
                subcategory: "Announcements",
                filePath: null,
              });
            }

            return { category: cat, items };
          });

          setPdfLinks(categories);
        }
      } catch (err) {
        console.error("Error fetching PDFs:", err);
      }
    };

    fetchPdfs();
  }, []);

  // clicking a subcategory — filter items and show them
  const handleSubCategoryClick = (categoryItems, subCat) => {
    const filtered = categoryItems.filter((it) => it.subcategory === subCat);
    setSelectedCategoryItems(filtered);
    setSelectedSubCategory(subCat);
    setShowContentP(false);
    setSelectedPdf(null);
    setSearchQuery("");
  };

  const handlePdfClick = (filePath, e) => {
    e.preventDefault();
    if (!filePath) return;
    const url = `http://localhost:5001/${filePath.replace(/\\/g, "/")}`;
    setSelectedPdf(url);
  };

  const filteredPdfs = selectedCategoryItems.filter((it) =>
    it.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setNoResults(filteredPdfs.length === 0 && searchQuery.length > 0);
  }, [filteredPdfs, searchQuery]);

  return (
    <div className="content-wrapper">
      {/* TOP NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3">
        <span className="navbar-brand">Aditya University — Intranet</span>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#topNav"
          aria-controls="topNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="topNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {pdfLinks.map((cat, idx) => (
              <li key={idx} className="nav-item dropdown hover-dropdown mx-2">
                <span className="nav-link dropdown-toggle" role="button">
                  {cat.category}
                </span>

                {/* DROP-DOWN ON HOVER — subcategories horizontally stacked */}

    <div className="dropdown-on-hover shadow">
        {[...new Set(cat.items.map((i) => i.subcategory))].map((sub, sidx) => (
            <div
                key={sidx}
                className="dropdown-item"
                onClick={() => handleSubCategoryClick(cat.items, sub)}
            >
                {sub}
            </div>
        ))}
    </div>

              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* SUBHEADER (shows selected category + subcategory) */}
      <div className="container py-3">
        {selectedSubCategory && (
          <div className="mb-3">
            <h6 className="m-0">
              Showing: <strong>{selectedSubCategory}</strong>
            </h6>
          </div>
        )}

        {/* CONTENT */}
        {showContentP ? (
          <p className="lead">
            Aditya University is a State Private University formed under the
            Andhra Pradesh Private Universities Act, 2016. Programs blend
            academic rigor with practical relevance...
          </p>
        ) : (
          <>
            {/* Search */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search PDFs in this subcategory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {noResults ? (
              <p className="text-danger">No search results found</p>
            ) : filteredPdfs.length > 0 ? (
              <div className="list-group">
                {filteredPdfs.map((item, i) => (
                  <button
                    key={i}
                    className="list-group-item list-group-item-action text-start"
                    onClick={(e) => item.filePath && handlePdfClick(item.filePath, e)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted">No items to display in this subcategory.</p>
            )}
          </>
        )}

        {/* PDF VIEWER */}
        {selectedPdf && (
          <div className="mt-4">
            <object
              data={selectedPdf}
              type="application/pdf"
              width="100%"
              height="700px"
            >
              <p>Your browser doesn't support embedded PDFs — download to view.</p>
            </object>

            <div className="mt-2">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedPdf(null)}
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Content;
