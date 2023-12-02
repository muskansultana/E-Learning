import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Input from "../../components/UI/Input/FormInput";
import SpinnerButton from "../../components/UI/Spinners/SpinnerButton";
import SumbitButton from "../../components/UI/Buttons/SumbitButton";
import authService from "../../ApiServices/auth.service";
// import Alert from "../alert";
class Profile extends Component {
  state = {
    Form: {
      name: {
        placeholder: "First Name",
        value: "",
        valid: false,
        type: "text",
        error: " ",
        msg: "",

        validation: {
          required: true,
          minLength: 5,
          maxLength: 15,
        },

        touched: false,
      },
      skills: {
        placeholder: "Your Skills",
        value: "",
        valid: false,
        type: "text",
        error: " ",
        msg: "",

        validation: {
          required: false,
        },

        touched: false,
      },
      interests: {
        placeholder: "Your Interests",
        value: "",
        valid: false,
        type: "text",
        error: " ",
        msg: "",

        validation: {
          required: false,
        },

        touched: false,
      },
      goals: {
        placeholder: "Your Goals",
        value: "",
        valid: false,
        type: "text",
        error: " ",
        msg: "",

        validation: {
          required: false,
        },

        touched: false,
      },
      email: {
        placeholder: "Email",
        value: "",
        valid: false,
        type: "email",
        error: " ",
        msg: "",

        validation: {
          required: true,
          //eslint-disable-next-line
          regex: /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/,
        },
        touched: false,
      },
    },

    loading: false,
    redirect: null,

    alert: {
      valid: false,
      msg: "",
      alertType: " ",
    },

    alertPressed: false,
  };

  AlertError(alertmsg, alertType) {
    const AlertArray = { ...this.state.alert };
    AlertArray.msg = alertmsg;
    AlertArray.valid = true;
    AlertArray.alertType = alertType;
    this.setState({ alert: AlertArray });
  }

  componentDidMount() {
    console.log("Auth called");
    authService
      .getUserDetails()
      .then((response) => {
        console.log("response", response.data.user);
        const newForm = {
          ...this.state.Form,
        };

        newForm.name.value = response.data.user.name;
        newForm.email.value = response.data.user.email;
        newForm.skills.value = response.data.user.skills;
        newForm.goals.value = response.data.user.goals;
        newForm.interests.value = response.data.user.interests;

        this.setState({
          Form: newForm,
        });

        let count = 0;

        for (let j in response.data.course.videoContent) {
          for (let i in response.data.course.videoContent[j].usersWatched) {
            if (
              localStorage.getItem("userId") ===
              response.data.course.videoContent[j].usersWatched[i]
            ) {
              this.setState({ ["video" + j + "Completed"]: true });
              count += 1;
              break;
            }
          }
        }

        let progress =
          (count / this.state.CoursesInfo.videoContent.length) * 100;
        this.setState({ WatchedVideoCount: count, progress: progress });
      })
      .catch((error) => {
        console.log(error.response);
      });
  }
  checkValidity(value, rules) {
    let isValid = true;
    const regex = rules.regex;

    if (rules.required) {
      isValid = value.trim() !== "" && isValid;
    }

    if (rules.minLength) {
      isValid = value.length >= rules.minLength && isValid;
    }

    if (rules.maxLength) {
      isValid = value.length <= rules.maxLength && isValid;
    }

    if (rules.regex) {
      isValid = regex.test(value) && isValid;
    }

    return isValid;
  }

  //   runs whenever there is any change in the input field
  inputchangeHandler = (event, inputIdentifier) => {
    const updatedForm = {
      ...this.state.Form,
    };
    const updatedElement = { ...updatedForm[inputIdentifier] };

    updatedElement.value = event.target.value;

    updatedForm[inputIdentifier] = updatedElement;
    this.setState({ Form: updatedForm });

    updatedElement.valid = this.checkValidity(
      updatedElement.value,
      updatedElement.validation
    );
  };

  inputBlurHandler = (event, inputIdentifier) => {
    const updatedForm = {
      ...this.state.Form,
    };
    const updatedElement = { ...updatedForm[inputIdentifier] };

    // msg errrors for username

    if (inputIdentifier === "name" && !updatedElement.valid) {
      updatedElement.error = "Minimum:5 and Maximum:15 characters";
      updatedElement.msg = "";
    }
    if (inputIdentifier === "name" && updatedElement.valid) {
      updatedElement.error = "";
      updatedElement.msg = "valid";
    }

    // msg errors for email
    if (inputIdentifier === "email" && !updatedElement.valid) {
      updatedElement.error = "Invalid format";
      updatedElement.msg = "";
    }
    if (inputIdentifier === "email" && updatedElement.valid) {
      updatedElement.error = "";
      updatedElement.msg = "valid";
    }

    updatedForm[inputIdentifier] = updatedElement;
    this.setState({ Form: updatedForm });
  };

  OverallValidity = () => {
    for (let validate in this.state.Form) {
      if (!this.state.Form[validate].valid) {
        return false;
      }
    }
    return true;
  };

  formHandler = (event) => {
    console.log("called");
    event.preventDefault();
    this.setState({ alertPressed: true });
    setTimeout(this.timeout, 3000);
    this.setState({ loading: true });

    localStorage.setItem("email", this.state.Form["email"].value);

    const formData = {};
    for (let formElement in this.state.Form) {
      formData[formElement] = this.state.Form[formElement].value;
    }

    console.log("auth");
    authService
      .update(formData)
      .then((response) => {
        console.log("Response:", response);

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("valid", true);
        localStorage.setItem("type", "success");
        localStorage.setItem("msg", response.data.message);
      })
      //  alert("Something went wrong")})

      .catch((error) => {
        console.log(error.response);
        this.setState({ loading: false });
        this.AlertError(error.response.data.message[0].msg, "danger");
      });
  };

  timeout = () => {
    let temp = { ...this.state.alert };
    temp.msg = "";
    temp.alertType = "";

    this.setState({ alert: temp, alertPressed: false });
  };

  render() {
    let alertContent = null;

    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />;
    }

    const formElementsArray = [];
    for (let key in this.state.Form) {
      formElementsArray.push({
        id: key,
        config: this.state.Form[key],
      });
    }

    let SigninSumbitButton = (
      <SumbitButton className={"Sumbit-btn"} Label={"Submit Changes"} />
    );

    if (this.state.loading) {
      SigninSumbitButton = <SpinnerButton spinnerclass={"Sumbit-btn"} />;
    }

    let form = (
      <div className="login-form">
        <form onSubmit={this.formHandler}>
          {formElementsArray.map((x) => (
            <div>
              <h5>{x.config.placeholder}</h5>
              <Input
                key={x.id}
                placeholder={x.config.placeholder}
                value={x.config.value}
                type={x.config.type}
                invalid={!x.config.valid}
                touched={x.config.touched}
                errors={x.config.error}
                msg={x.config.msg}
                blur={(event) => this.inputBlurHandler(event, x.id)}
                changed={(event) => this.inputchangeHandler(event, x.id)}
              />
            </div>
          ))}

          {SigninSumbitButton}
        </form>
      </div>
    );

    return (
      <Layout>
        {alertContent}
        <div className="SideContent">{form}</div>
      </Layout>
    );
  }
}

export default Profile;
