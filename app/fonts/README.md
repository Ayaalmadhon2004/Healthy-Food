Self-hosted fonts (SIL Open Font License 1.1), taken from the npm packages
`@fontsource-variable/inter`, `@fontsource-variable/cairo` and `@fontsource/poppins`
so builds never depend on fonts.googleapis.com.

Inter and Cairo are variable fonts cut to the weight range the site uses (400 to 600) with
`fonttools varLib.instancer <file> wght=400:600`. Poppins is kept at weights 500 and 600 only.
