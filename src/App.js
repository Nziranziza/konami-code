import * as yup from "yup";
import { Formik } from "formik";
import clsx from "clsx";
import { useState, useRef, useEffect, useCallback } from "react";
import { debounce } from 'lodash';

const validationSchema = yup.object().shape({
  code: yup
    .string()
    .required("Secret code is required")
    .matches("injects3crets", "Invalid code"),
});

const getIsuues = () =>
  fetch(
    "https://api.github.com/repos/elixir-lang/elixir/issues?per_page=5"
  ).then((res) => res.json());

function App() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const formRef = useRef();

  const handleKeyPress = useCallback(({ key }) => {
    if(key === 'Escape') {
      formRef.current.resetForm()
    }
  }, []);

  useEffect(() => {
    window.document.addEventListener('keydown', handleKeyPress);
    return () => window.document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress])

  const onSubmit = async (_, { resetForm }) => {
    try {
      setLoading(true);
      const issues = await getIsuues();
      setIssues(issues);
      setTimeout(() => {
       setIssues([])
      }, "15000")
    } catch (error) {
      console.log(error);
      setIssues([]);
    } finally {
      setLoading(false);
      resetForm();
    }
  };

  const resetForm = debounce(() => {
    formRef.current.resetForm()
  }, 5000)

  return (
    <div className="container">
      <header>
        <h1>Sweet kittens</h1>
      </header>
      <main>
        <div className="issues">
          {issues.map(({ user: { login }, title }) => (
            <div className="issue">
              <div>
                <span className="label">Issue Name:</span>
                <span>{title}</span>
              </div>
              <div>
                <span className="label">Author Nickname:</span>
                <span>{login}</span>
              </div>
            </div>
          ))}
        </div>
        {loading && <span>Loading...</span>}
        {!loading && !issues.length && (
          <Formik
            initialValues={{ code: "" }}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            innerRef={formRef}
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleSubmit,
              handleChange,
            }) => (
              <form onSubmit={handleSubmit}>
                <input
                  type="password"
                  name="code"
                  placeholder="Enter your scret code"
                  onChange={(e) => {
                    handleChange(e)
                    resetForm()
                  }}
                  onBlur={handleBlur}
                  value={values.code}
                  className={clsx({ error: errors.code && touched.code })}
                />
                <div>
                  {errors.code && touched.code && (
                    <small className="error">{errors.code}</small>
                  )}
                </div>
              </form>
            )}
          </Formik>
        )}
      </main>
    </div>
  );
}

export default App;
