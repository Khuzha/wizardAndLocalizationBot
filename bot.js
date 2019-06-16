const Telegraf = require('telegraf')
const path = require('path')
const Composer = require('telegraf/composer')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Extra = require('telegraf/extra') 
const Markup = require('telegraf/markup')
const data = require('./data')
const superWizard = require('./wizard')
const TelegrafI18n = require('telegraf-i18n')


const i18n = new TelegrafI18n({
  defaultLanguage: 'en',
  allowMissing: false, 
  directory: path.resolve(__dirname, 'locales')
})

const bot = new Telegraf(data.token)
const stage = new Stage()
stage.register(superWizard)

bot.use(i18n.middleware())
bot.use(session())
bot.use(stage.middleware())


bot.start(({ i18n, replyWithHTML }) => {
  replyWithHTML(
  i18n.t('whatDo'),
  Extra
    .markup(Markup.keyboard([
      [i18n.t('buttons.signUp'), i18n.t('buttons.contacts')]
    ]).resize())
  )
})

bot.hears(TelegrafI18n.match('buttons.contacts'), ({ i18n, replyWithHTML }) => {
  replyWithHTML(i18n.t('ourNumber'))
})

bot.hears(TelegrafI18n.match('buttons.signUp'), (ctx) => {
  ctx.scene.enter('super-wizard')
})

bot.action(/loc_*/, (ctx) => {
  ctx.answerCbQuery()

  const latitude = ctx.update.callback_query.data.substr(4, 9)
  const longitude = ctx.update.callback_query.data.substr(14, 9)

  ctx.replyWithLocation(
    latitude, longitude,
    Extra
      .inReplyTo(ctx.update.callback_query.message.message_id)
  )
})

bot.launch()