import React, { Component } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import MerchantTable from "../components/Merchant_Table";
import MessageBox from "../components/Message_box";

import { TotalUserIcon, ActiveUserIcon, InactiveUserIcon, PendingUserIcon } from "../../media/icon/SVGicons";

class ListSettlement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebaropen: true,
      token: this.getCookie('token'),
      headerLabels: [
        { id: 1, heading: "Client", label: "company_name" },
        { id: 2, heading: "Status", label: "status" },
        { id: 3, heading: "Email", label: "email" },
        { id: 4, heading: "Country", label: "country" },
        { id: 5, heading: "Skype ID", label: "skype_id" },
        { id: 6, heading: "URL", label: "website_url" },
      ],
      apiData: [],
      showMerchants: "all",
      errorMessage: "",
      messageType: "",
      loading: false,
      notifications: [],
    };
  }

  componentDidMount() {
    this.fetchData();
    this.handleQueryParams();
  }

  getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  fetchData = async () => {
    const backendURL = process.env.REACT_APP_BACKEND_URL;
    const { token } = this.state;
    this.setState({ loading: true });
  
    try {
      const response = await fetch(`${backendURL}/clients`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        let data = await response.json();
        const { apiData } = this.state;
  
        // Filter for merchants with "Pending" status
        const pendingMerchants = data.filter(item => item.status === "Pending");
        const pendingCount = pendingMerchants.length;
  
        let notifications = [];
  
        // If there are any pending merchants, add a notification
        if (pendingCount > 0) {
          notifications.push({
            message: `There are ${pendingCount} merchants with status Pending`,
            type: "warning",
          });
          sessionStorage.setItem("pendingMerchants", JSON.stringify(pendingMerchants));
        }
  
        // Check if client count has increased
        const previousClientCount = apiData.length;
        const currentClientCount = data.length;
  
        if (currentClientCount > previousClientCount) {
          notifications.push({
            message: `Client count has increased to ${currentClientCount}`,
            type: "info",
          });
        }
  
        // Store notifications in session storage
        sessionStorage.setItem("notifications", JSON.stringify(notifications));
  
        // Update the state with the fetched data
        this.setState({
          apiData: data,
          loading: false,
        });
      } else {
        console.error("Error fetching data:", response.statusText);
        this.setState({
          errorMessage: "Error in fetching data. Please try again later.",
          messageType: "fail",
          loading: false,
        });
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      this.setState({
        errorMessage: "An unexpected error occurred. Please try again later.",
        messageType: "",
        loading: false,
      });
    }
  };
  
  
  handleTabClick = (status) => {
    this.setState({ showMerchants: status });
  };

  handleQueryParams = () => {
    const query = new URLSearchParams(window.location.search);
    const showPending = query.get('showPending');
    
    if (showPending === 'true') {
      this.setState({ showMerchants: 'Pending' });
    }
  };

  render() {
    const { headerLabels, apiData, showMerchants, errorMessage, messageType,notifications } = this.state;

    const filteredData = showMerchants === "all"
      ? apiData
      : apiData.filter(item => item.status === showMerchants);

    const merchants = apiData.filter(item => item.type === "Merchant").length;
    const psps = apiData.filter(item => item.type === "PSP").length;
    const activeMerchants = apiData.filter(item => item.status === "Active" && item.type === "Merchant").length;
    const activePsps = apiData.filter(item => item.status === "Active" && item.type === "PSP").length;
    const inactiveMerchants = apiData.filter(item => item.status === "Inactive" && item.type === "Merchant").length;
    const inactivePsps = apiData.filter(item => item.status === "Inactive" && item.type === "PSP").length;
    const pendingMerchants = apiData.filter(item => item.status === "Pending" && item.type === "Merchant").length;
    const pendingPsps = apiData.filter(item => item.status === "Pending" && item.type === "PSP").length;

    return (
      <>
        <Header
          errorMessage={errorMessage}
          messageType={messageType}
          onClearMessage={() => this.setState({ errorMessage: "", messageType: "" })}
        />
        <Sidebar />
        {errorMessage && (
          <MessageBox
            message={errorMessage}
            messageType={messageType}
            onClose={() => this.setState({ errorMessage: "", messageType: "" })}
          />
        )}
        <div
          className={`main-screen ${
            this.state.sidebaropen
              ? "collapsed-main-screen"
              : "expanded-main-screen"
          }`}
        >
          <div className="main-screen-rows settlement-first-row">
            <div className="row-cards merchant-card" onClick={() => this.handleTabClick("all")}>
              <div className="merchant-card-top">
                <div className="merchant-card-left">
                  <p className="p2">Total</p>
                  <h4>{apiData.length}</h4>
                </div>
                <div className="merchant-card-right">
                  <div className="creditcard-div">
                    <TotalUserIcon className="creditcard-img primary-color-icon" />
                  </div>
                </div>
              </div>
              <div className="merchant-card-details">
                <li className="p2">{merchants} Merchants</li>
                <li className="p2">{psps} PSPs</li>
              </div>
            </div>
            <div className="row-cards merchant-card" onClick={() => this.handleTabClick("Active")}>
              <div className="merchant-card-top">
                <div className="merchant-card-left">
                  <p className="p2">Active</p>
                  <h4>{activeMerchants + activePsps}</h4>
                </div>
                <div className="merchant-card-right">
                  <div className="creditcard-div active-merchant">
                    <ActiveUserIcon className="creditcard-img green-icon" />
                  </div>
                </div>
              </div>
              <div className="merchant-card-details">
                <li className="p2">{activeMerchants} Merchants</li>
                <li className="p2">{activePsps} PSPs</li>
              </div>
            </div>
            <div className="row-cards merchant-card" onClick={() => this.handleTabClick("Inactive")}>
              <div className="merchant-card-top">
                <div className="merchant-card-left">
                  <p className="p2">Inactive</p>
                  <h4>{inactiveMerchants + inactivePsps}</h4>
                </div>
                <div className="merchant-card-right">
                  <div className="creditcard-div inactive-merchant">
                    <InactiveUserIcon className="creditcard-img red-icon" />
                  </div>
                </div>
              </div>
              <div className="merchant-card-details">
                <li className="p2">{inactiveMerchants} Merchants</li>
                <li className="p2">{inactivePsps} PSPs</li>
              </div>
            </div>
            <div className="row-cards merchant-card" onClick={() => this.handleTabClick("Pending")}>
              <div className="merchant-card-top">
                <div className="merchant-card-left">
                  <p className="p2">Pending</p>
                  <h4>{pendingMerchants + pendingPsps}</h4>
                </div>
                <div className="merchant-card-right">
                  <div className="creditcard-div pending-merchant">
                    <PendingUserIcon className="creditcard-img yellow-icon" />
                  </div>
                </div>
              </div>
              <div className="merchant-card-details">
                <li className="p2">{pendingMerchants} Merchants</li>
                <li className="p2">{pendingPsps} PSPs</li>
              </div>
            </div>
          </div>
          <div className="main-screen-rows settlement-second-row">
            <div className="row-cards merchant-table-card">
              <MerchantTable
                headerLabels={headerLabels}
                apiData={filteredData}
                showMerchants={showMerchants}
                loading={this.state.loading}
                buttonname={"Add New Merchant"}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default ListSettlement;
