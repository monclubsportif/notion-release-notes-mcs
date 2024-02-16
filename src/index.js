const core = require('@actions/core')
const { Client, LogLevel } = require('@notionhq/client')
const { markdownToBlocks } = require('@tryfabric/martian')

try {
  // `who-to-greet` input defined in action metadata file
  const body = core.getInput('body')
  const version = core.getInput('version')
  const token = core.getInput('token')
  const products = core.getInput('products') || ''
  const database = core.getInput('database')
  const date = new Date().toISOString()

  core.debug('Creating notion client ...')
  const notion = new Client({
    auth: token,
    logLevel: LogLevel.ERROR
  })

  const blocks = markdownToBlocks(body)
  const tagArray = products ? products.split(',').flatMap(tag => { return { version: tag } }) : []

  core.debug('Creating page ...')
  notion.pages.create({
    parent: {
      database_id: database
    },
    properties: {
      Version: {
        title: [
          {
            text: {
              content: version
            }
          }
        ]
      },
      'Date de mise en ligne': {
        date: {
          start: date
        }
      },
      Produit: {
        multi_select: tagArray
      }
    },
    children: blocks
  }).then((result) => {
    core.debug(`${result}`)
    core.setOutput('status', 'complete')
  })
} catch (error) {
  core.setFailed(error.message)
}
